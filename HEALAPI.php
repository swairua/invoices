<?php
/**
 * Local API backend for the invoicing app
 * Connects to the hycmvsgn_heal database (real Invoice Ninja data) on localhost:3308
 * Implements the actions the ExternalAPIAdapter sends:
 *   login, check_auth, refresh_token, signup, logout,
 *   read, create, update, delete, raw, rpc
 *
 * Login authenticates against the real `users` table (bcrypt password).
 * Generic CRUD operates on the raw schema (real Invoice Ninja tables + added app tables).
 */

// ---------------------------------------------------------------------------
// CORS + JSON handling
// ---------------------------------------------------------------------------
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3308');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_NAME', getenv('DB_NAME') ?: 'hycmvsgn_heal');
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'local-heal-jwt-secret-change-me');
define('JWT_TTL', 60 * 60 * 24 * 7); // 7 days

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------
function db_connect() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
    if ($conn->connect_errno) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed: ' . $conn->connect_error,
        ]);
        exit;
    }
    $conn->set_charset('utf8mb3');
    return $conn;
}

// ---------------------------------------------------------------------------
// JWT helpers (HS256)
// ---------------------------------------------------------------------------
function b64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode($data) {
    $padding = strlen($data) % 4;
    if ($padding > 0) $data .= str_repeat('=', 4 - $padding);
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode($payload) {
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    $segments = [
        b64url_encode(json_encode($header)),
        b64url_encode(json_encode($payload)),
    ];
    $signature = hash_hmac('sha256', $segments[0] . '.' . $segments[1], JWT_SECRET, true);
    $segments[] = b64url_encode($signature);
    return implode('.', $segments);
}

function jwt_decode($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    $signature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], JWT_SECRET, true);
    if (!hash_equals($signature, b64url_decode($parts[2]))) return null;
    $payload = json_decode(b64url_decode($parts[1]), true);
    if (!$payload) return null;
    if (isset($payload['exp']) && time() > $payload['exp']) return null;
    return $payload;
}

function get_bearer_token() {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $auth, $m)) return $m[1];
    return null;
}

function require_auth() {
    $token = get_bearer_token();
    $payload = $token ? jwt_decode($token) : null;
    if (!$payload || !isset($payload['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
        exit;
    }
    return $payload;
}

// ---------------------------------------------------------------------------
// Read request body (JSON)
// ---------------------------------------------------------------------------
function request_body() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// ---------------------------------------------------------------------------
// Safe identifier (table / column) - only allow [a-zA-Z0-9_]
// ---------------------------------------------------------------------------
function safe_ident($name) {
    if (!is_string($name) || !preg_match('/^[a-zA-Z0-9_]+$/', $name)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid identifier: ' . $name]);
        exit;
    }
    return $name;
}

// ---------------------------------------------------------------------------
// Company branding config (local file, never touches real DB tables)
// The app thinks in "companies" with columns like logo_url/primary_color/name,
// but the real Invoice Ninja schema stores these on the `accounts` table (with
// `logo` instead of `logo_url`) and the `companies` table is only a billing/plan
// table with none of those columns. To avoid mutating real data, company-config
// writes are persisted to a small JSON file and reads merge that file over clean
// default branding. This powers both the public site branding and the admin
// Image Management / logo upload feature.
// ---------------------------------------------------------------------------
define('LOCAL_CONFIG_DIR', __DIR__ . '/local');

function local_company_config_path() {
    return LOCAL_CONFIG_DIR . '/company-config.json';
}

function ensure_local_config_dir() {
    if (!is_dir(LOCAL_CONFIG_DIR)) {
        @mkdir(LOCAL_CONFIG_DIR, 0777, true);
    }
}

function default_company_config() {
    return [
        'id' => 1,
        'name' => 'Haemonetics East Africa Limited',
        'email' => 'sales@heal.co.ke',
        'phone' => '+254 207 863 782',
        'address' => 'Naivasha Road, Kamrose Plaza, 1st Flr, Rm 14',
        'city' => 'Nairobi',
        'state' => 'Nairobi',
        'country' => 'Kenya',
        'postal_code' => 'P.O Box 61214-00200, Nairobi',
        'currency' => 'KES',
        'website' => 'https://www.heal.co.ke',
        'description' => 'Haemonetics East Africa Limited supplies laboratory reagents, instrumentation and diagnostic equipment to hospitals, universities, research and industrial clients across East Africa.',
        'logo_url' => '/fallback-logo.svg',
        'primary_color' => '#0d9488',
        'secondary_color' => '#000000',
        'status' => 'active',
        'pdf_background_image' => '',
        'pdf_background_opacity' => '100',
    ];
}

function read_local_company_config() {
    ensure_local_config_dir();
    $path = local_company_config_path();
    if (!is_file($path)) {
        return default_company_config();
    }
    $raw = @file_get_contents($path);
    $data = $raw ? json_decode($raw, true) : null;
    if (!is_array($data)) {
        return default_company_config();
    }
    // Merge over defaults so new defaults automatically apply
    return array_merge(default_company_config(), $data);
}

function write_local_company_config(array $overrides) {
    ensure_local_config_dir();
    $current = read_local_company_config();
    // Only persist recognised branding fields; ignore anything else (e.g. id/where)
    $allow = ['logo_url', 'primary_color', 'secondary_color', 'name', 'email', 'phone', 'address', 'city', 'state', 'country', 'postal_code', 'website', 'currency', 'description', 'status', 'pdf_background_image', 'pdf_background_opacity'];
    // Fields where an empty string is a valid value (used to clear the setting)
    $clearable = ['pdf_background_image', 'pdf_background_opacity'];
    foreach ($allow as $k) {
        if (array_key_exists($k, $overrides) && $overrides[$k] !== null) {
            $value = is_array($overrides[$k]) || is_object($overrides[$k]) ? json_encode($overrides[$k]) : (string) $overrides[$k];
            if ($value === '' && !in_array($k, $clearable, true)) {
                continue;
            }
            $current[$k] = $value;
        }
    }
    $ok = file_put_contents(local_company_config_path(), json_encode($current, JSON_PRETTY_PRINT));
    return $ok !== false ? $current : null;
}

// Merge the admin-saved branding (from local/company-config.json) over rows read
// from the real `accounts` table. The accounts.logo column holds a legacy bare
// filename (e.g. "<account_key>.png") that no longer maps to a servable file, so
// it is replaced with the correct logo_url uploaded via Admin Settings. Also
// applies to name/colors/contact so the app tier (login, sidebar, PDFs) gets a
// consistent, up-to-date brand.
function augment_accounts_branding(array $rows) {
    $cfg = read_local_company_config();
    foreach ($rows as $i => $row) {
        if (!is_array($row)) continue;
        $rows[$i]['name'] = !empty($cfg['name']) ? $cfg['name'] : ($row['name'] ?? '');
        $rows[$i]['work_email'] = !empty($cfg['email']) ? $cfg['email'] : ($row['work_email'] ?? '');
        $rows[$i]['work_phone'] = !empty($cfg['phone']) ? $cfg['phone'] : ($row['work_phone'] ?? '');
        $rows[$i]['address1'] = !empty($cfg['address']) ? $cfg['address'] : ($row['address1'] ?? '');
        $rows[$i]['address2'] = !empty($cfg['address2']) ? $cfg['address2'] : ($row['address2'] ?? '');
        $rows[$i]['city'] = !empty($cfg['city']) ? $cfg['city'] : ($row['city'] ?? '');
        $rows[$i]['state'] = !empty($cfg['state']) ? $cfg['state'] : ($row['state'] ?? '');
        $rows[$i]['postal_code'] = !empty($cfg['postal_code']) ? $cfg['postal_code'] : ($row['postal_code'] ?? '');
        $rows[$i]['primary_color'] = !empty($cfg['primary_color']) ? $cfg['primary_color'] : ($row['primary_color'] ?? '');
        $rows[$i]['secondary_color'] = !empty($cfg['secondary_color']) ? $cfg['secondary_color'] : ($row['secondary_color'] ?? '');
        // Replace the legacy bare accounts.logo with the real uploaded logo URL.
        // The frontend schema map converts `logo` -> `logo_url`, so set both.
        if (!empty($cfg['logo_url'])) {
            $rows[$i]['logo'] = $cfg['logo_url'];
            $rows[$i]['logo_url'] = $cfg['logo_url'];
        }
        // PDF/export fields: expose the admin-configured values so the app tier
        // (PDFs, statements) uses the same currency and background image.
        $rows[$i]['currency'] = !empty($cfg['currency']) ? $cfg['currency'] : ($row['currency'] ?? '');
        $rows[$i]['pdf_background_image'] = $cfg['pdf_background_image'] ?? '';
        $rows[$i]['pdf_background_opacity'] = $cfg['pdf_background_opacity'] ?? '100';
    }
    return $rows;
}

// ---------------------------------------------------------------------------
// Build WHERE clause from a filter object (used by read/create/update/delete)

// Supports equality + query builder operators:
//   column_in, column_gt, column_gte, column_lt, column_lte, column_like
//   _order = {column, direction}, _limit = int
// ---------------------------------------------------------------------------
function build_filter_sql($conn, $filter, &$params) {
    $where = [];
    $orderBy = null;
    $limit = null;

    if (is_array($filter)) {
        foreach ($filter as $key => $value) {
            if ($key === '_order' && is_array($value)) {
                $col = safe_ident($value['column'] ?? 'id');
                $dir = strtolower($value['direction'] ?? 'asc') === 'desc' ? 'DESC' : 'ASC';
                $orderBy = "ORDER BY `$col` $dir";
                continue;
            }
            if ($key === '_limit' && is_numeric($value)) {
                $limit = (int) $value;
                continue;
            }
            if (!is_string($key) || !preg_match('/^[a-zA-Z0-9_]+$/', $key)) continue;

            if (preg_match('/^(.+)_in$/', $key, $m)) {
                $col = safe_ident($m[1]);
                if (is_array($value) && count($value) > 0) {
                    $placeholders = [];
                    foreach ($value as $v) {
                        $placeholders[] = '?';
                        $params[] = $v;
                    }
                    $where[] = "`$col` IN (" . implode(',', $placeholders) . ')';
                }
                continue;
            }
            if (preg_match('/^(.+)_gt$/', $key, $m)) { $col = safe_ident($m[1]); $where[] = "`$col` > ?"; $params[] = $value; continue; }
            if (preg_match('/^(.+)_gte$/', $key, $m)) { $col = safe_ident($m[1]); $where[] = "`$col` >= ?"; $params[] = $value; continue; }
            if (preg_match('/^(.+)_lt$/', $key, $m)) { $col = safe_ident($m[1]); $where[] = "`$col` < ?"; $params[] = $value; continue; }
            if (preg_match('/^(.+)_lte$/', $key, $m)) { $col = safe_ident($m[1]); $where[] = "`$col` <= ?"; $params[] = $value; continue; }
            if (preg_match('/^(.+)_like$/', $key, $m)) { $col = safe_ident($m[1]); $where[] = "`$col` LIKE ?"; $params[] = $value; continue; }

            // Plain equality
            $col = safe_ident($key);
            $where[] = "`$col` = ?";
            $params[] = $value;
        }
    }

    return [
        'where' => $where,
        'order_by' => $orderBy,
        'limit' => $limit,
    ];
}

// ---------------------------------------------------------------------------
// Build WHERE from a raw string (update/delete "where" query param)
// e.g. "id='123' AND company_id=5"  ->  validated, parameterized
// ---------------------------------------------------------------------------
function build_where_from_string($conn, $whereString) {
    $where = [];
    $params = [];
    if (is_string($whereString) && $whereString !== '') {
        // Split on AND (also handle JSON where bodies like {"id":"123"})
        if (preg_match('/^\{.*\}$/', trim($whereString))) {
            $decoded = json_decode($whereString, true);
            if (is_array($decoded)) {
                $res = build_filter_sql($conn, $decoded, $params);
                return ['where' => $res['where'], 'params' => $params];
            }
        }
        $clauses = preg_split('/\s+AND\s+/i', trim($whereString));
        foreach ($clauses as $clause) {
            $clause = trim($clause);
            if ($clause === '') continue;
            if (preg_match("/^([a-zA-Z0-9_]+)\s*=\s*(.*)$/", $clause, $m)) {
                $col = safe_ident($m[1]);
                $val = trim($m[2]);
                $val = trim($val, "'\"");
                $where[] = "`$col` = ?";
                $params[] = $val;
            } else {
                // Fall back to allowing it only if purely identifiers/numbers/operators
                if (preg_match('/^[a-zA-Z0-9_`=\'\"\s.,()<>!-]+$/', $clause)) {
                    $where[] = $clause;
                }
            }
        }
    }
    return ['where' => $where, 'params' => $params];
}

// ---------------------------------------------------------------------------
// Schema-aware write layer.
// The app writes app-named columns (e.g. total_amount, created_by, status)
// but the live database is the real Invoice Ninja schema. This layer makes
// every write "work with the database columns":
//   1. fetch the target table's actual columns (cached per request)
//   2. DROP payload keys that aren't real columns
//   3. for INSERT, inject sensible defaults for required (NOT NULL, no
//      default) columns the app never sends (public_id, tax_rate1/2, ...)
// ---------------------------------------------------------------------------
function table_columns($conn, $table) {
    static $cache = [];
    if (!isset($cache[$table])) {
        $cols = [];
        $stmt = $conn->prepare("SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, EXTRA FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?");
        if ($stmt) {
            $stmt->bind_param('s', $table);
            $stmt->execute();
            $res = $stmt->get_result();
            while ($row = $res->fetch_assoc()) $cols[$row['COLUMN_NAME']] = $row;
            $stmt->close();
        }
        $cache[$table] = $cols;
    }
    return $cache[$table];
}

function next_public_id($conn, $table) {
    $stmt = $conn->prepare("SELECT COALESCE(MAX(public_id),0)+1 FROM `$table`");
    if (!$stmt) return mt_rand(1, 99999999);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_row();
    $stmt->close();
    return (int) ($row[0] ?? 0) + 1;
}

// Defaults for required Invoice Ninja columns the app never supplies.
const WRITE_COLUMN_DEFAULTS = [
    'account_id' => 1,
    'user_id' => 1,
    'discount' => 0,
    'frequency_id' => 1,
    'tax_name1' => '',
    'tax_name2' => '',
    'tax_rate1' => 0,
    'tax_rate2' => 0,
    'refunded' => 0,
    'exchange_currency_id' => 1,
    'exchange_rate' => 1,
    'invoice_type_id' => 1,
    'is_deleted' => 0,
    'is_recurring' => 0,
    'has_tasks' => 0,
    'auto_bill' => 0,
    'has_expenses' => 0,
    'client_enable_auto_bill' => 0,
    'is_public' => 1,
    'payment_status_id' => 4,
    'invoice_item_type_id' => 1,
    'qty' => 0,
    'cost' => 0,
    'product_key' => '',
    'notes' => '',
    'po_number' => '',
    'terms' => '',
    'public_notes' => '',
    'private_notes' => '',
    'payment_type_id' => 3,
    'source_reference' => '',
];

/**
 * Filter/normalize a write payload so it only contains real columns of `$table`.
 * $forInsert: also inject required-column defaults.
 */
function schema_write_filter($conn, $table, $data, $forInsert) {
    if (!is_array($data) || count($data) === 0) return $data;
    $cols = table_columns($conn, $table);
    if (count($cols) === 0) return $data; // unknown table - let SQL surface the error

    $clean = [];
    foreach ($data as $key => $value) {
        if (is_string($key) && isset($cols[$key])) {
            $clean[$key] = $value;
        }
    }

    if ($forInsert) {
        foreach ($cols as $name => $meta) {
            if (array_key_exists($name, $clean)) continue;
            $isAutoInc = strpos($meta['EXTRA'], 'auto_increment') !== false;
            if ($isAutoInc) continue;
            if ($meta['IS_NULLABLE'] === 'NO' && $meta['COLUMN_DEFAULT'] === null) {
                if ($name === 'public_id') {
                    $clean[$name] = next_public_id($conn, $table);
                } elseif (defined('WRITE_COLUMN_DEFAULTS') && array_key_exists($name, WRITE_COLUMN_DEFAULTS)) {
                    $clean[$name] = WRITE_COLUMN_DEFAULTS[$name];
                }
            }
        }
        // users: real schema requires username + account_id; derive from the
        // email the app sends so admin user creation works.
        if ($table === 'users' && !isset($clean['username']) && isset($clean['email'])) {
            $clean['username'] = $clean['email'];
        }
    }

    return $clean;
}

// ---------------------------------------------------------------------------
// Execute prepared statement and return rows
// ---------------------------------------------------------------------------
function execute_query($conn, $sql, $params) {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'SQL prepare failed: ' . $conn->error]);
        exit;
    }
    if (count($params) > 0) {
        $types = '';
        foreach ($params as $p) {
            if (is_int($p) || (is_string($p) && preg_match('/^-?\d+$/', $p))) $types .= 'i';
            elseif (is_float($p)) $types .= 'd';
            else $types .= 's';
        }
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();
    return $result;
}

// ---------------------------------------------------------------------------
// Resolve user row (used by login/check_auth) into app-usable shape
// ---------------------------------------------------------------------------
function resolve_user($conn, $row) {
    $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
    if ($fullName === '') $fullName = $row['username'] ?? $row['email'] ?? 'User';
    return [
        'id' => (string) $row['id'],
        'email' => $row['email'] ?? $row['username'] ?? '',
        'username' => $row['username'] ?? '',
        'full_name' => $fullName,
        'first_name' => $row['first_name'] ?? '',
        'last_name' => $row['last_name'] ?? '',
        'phone' => $row['phone'] ?? '',
        'role' => !empty($row['is_admin']) ? 'admin' : 'user',
        'is_admin' => !empty($row['is_admin']) ? 1 : 0,
        'account_id' => $row['account_id'] ?? null,
        'permissions' => $row['permissions'] ?? 0,
    ];
}

// ---------------------------------------------------------------------------
// Change password (shared by the change_password action and rpc dispatcher)
// ---------------------------------------------------------------------------
function handle_change_password($conn, $body = null) {
    if ($body === null) $body = request_body();
    $email = trim($body['email'] ?? '');
    $oldPassword = $body['old_password'] ?? '';
    $newPassword = $body['new_password'] ?? '';

    if ($email === '' || $newPassword === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email, old and new password are required']);
        return;
    }
    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'New password must be at least 6 characters']);
        return;
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1");
    $stmt->bind_param('ss', $email, $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        return;
    }
    if ($oldPassword !== '' && !password_verify($oldPassword, $user['password'] ?? '')) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Current password is incorrect']);
        return;
    }

    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
    $stmt->bind_param('si', $hash, $user['id']);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Password update failed: ' . $stmt->error]);
        $stmt->close();
        return;
    }
    $stmt->close();
    echo json_encode(['status' => 'success', 'message' => 'Password changed successfully']);
}

// ---------------------------------------------------------------------------
// Action router
// ---------------------------------------------------------------------------
$conn = db_connect();
$action = $_GET['action'] ?? $_POST['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    // =======================================================================
    case 'health':
    case 'config_debug':
        echo json_encode([
            'status' => 'success',
            'message' => 'API is healthy',
            'database' => DB_NAME,
            'port' => DB_PORT,
            'time' => date('c'),
        ]);
        break;

    // =======================================================================
    case 'login':
        $body = request_body();
        $email = trim($body['email'] ?? $body['username'] ?? '');
        $password = $body['password'] ?? '';

        if ($email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
            break;
        }

        $sql = "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ss', $email, $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if (!$user || !password_verify($password, $user['password'] ?? '')) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
            break;
        }

        $payload = [
            'sub' => (string) $user['id'],
            'user_id' => (string) $user['id'],
            'email' => $user['email'] ?? $user['username'] ?? '',
            'role' => !empty($user['is_admin']) ? 'admin' : 'user',
            'iat' => time(),
            'exp' => time() + JWT_TTL,
        ];
        $token = jwt_encode($payload);

        echo json_encode([
            'status' => 'success',
            'token' => $token,
            'user' => resolve_user($conn, $user),
        ]);
        break;

    // =======================================================================
    case 'check_auth':
        $body = request_body();
        $token = $body['token'] ?? get_bearer_token();
        $payload = $token ? jwt_decode($token) : null;
        if (!$payload || !isset($payload['user_id'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
            break;
        }

        $id = (int) $payload['user_id'];
        $stmt = $conn->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            break;
        }

        echo json_encode(resolve_user($conn, $user));
        break;

    // =======================================================================
    case 'refresh_token':
        $body = request_body();
        $userId = $body['user_id'] ?? $body['id'] ?? null;
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'user_id required']);
            break;
        }
        $id = (int) $userId;
        $stmt = $conn->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            break;
        }

        $payload = [
            'sub' => (string) $user['id'],
            'user_id' => (string) $user['id'],
            'email' => $user['email'] ?? $user['username'] ?? '',
            'role' => !empty($user['is_admin']) ? 'admin' : 'user',
            'iat' => time(),
            'exp' => time() + JWT_TTL,
        ];
        echo json_encode(['status' => 'success', 'token' => jwt_encode($payload)]);
        break;

    // =======================================================================
    case 'signup':
        $body = request_body();
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        if ($email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
            break;
        }
        // Existing users are real data - signup only allowed if email not already present
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1");
        $stmt->bind_param('ss', $email, $email);
        $stmt->execute();
        $exists = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($exists) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'An account with this email already exists']);
            break;
        }
        echo json_encode(['status' => 'error', 'message' => 'Self signup disabled: accounts are managed by an administrator.']);
        break;

    // =======================================================================
    case 'logout':
        echo json_encode(['status' => 'success', 'message' => 'Logged out']);
        break;

    // =======================================================================
    case 'read':
        require_auth();
        $table = safe_ident($_GET['table'] ?? '');
        if ($table === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'table required']);
            break;
        }
        $body = request_body();
        $filter = $body;

        // Also accept ?where= as JSON or SQL-string filter
        $whereParam = $_GET['where'] ?? null;
        $params = [];
        $whereSql = [];
        if ($whereParam) {
            $built = build_where_from_string($conn, $whereParam);
            $whereSql = $built['where'];
            $params = $built['params'];
        } elseif (is_array($filter) && count($filter) > 0) {
            $built = build_filter_sql($conn, $filter, $params);
            $whereSql = $built['where'];
            if ($built['order_by']) $orderBy = $built['order_by'];
            if ($built['limit']) $limit = $built['limit'];
        }

        $sql = "SELECT * FROM `$table`";
        if (count($whereSql) > 0) $sql .= ' WHERE ' . implode(' AND ', $whereSql);
        if (!empty($orderBy)) $sql .= ' ' . $orderBy;
        if (!empty($limit)) $sql .= ' LIMIT ' . (int) $limit;

        $result = execute_query($conn, $sql, $params);
        $rows = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) $rows[] = $row;
        }
        // Branding overrides: accounts rows carry the virtual "companies" data
        // that drives login/sidebar/PDFs. Merge admin-saved branding so the
        // correct logo_url is always served instead of the legacy bare filename.
        if ($table === 'accounts' && count($rows) > 0) {
            $rows = augment_accounts_branding($rows);
        }
        echo json_encode(['status' => 'success', 'data' => $rows, 'count' => count($rows)]);
        break;

    // =======================================================================
    // Public read-only endpoint - used by the public website.
    // NO authentication required. Strictly SELECT on a whitelist of tables so
    // anonymous visitors can browse the company catalog without ever touching
    // write paths or mutating real data.
    // =======================================================================
    case 'public_read': {
        $table = safe_ident($_GET['table'] ?? '');
        if ($table === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'table required']);
            break;
        }
        $publicTables = ['accounts', 'clients', 'products', 'invoices', 'invoice_items'];
        if (!in_array($table, $publicTables, true)) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Table not available for public access']);
            break;
        }
        $body = request_body();
        $params = [];
        $whereSql = [];
        $countOnly = !empty($body['_count_only']);
        $sumColumn = $body['_sum'] ?? null;

        if (is_array($body) && count($body) > 0) {
            // Strip control keys so build_filter_sql doesn't treat them as columns
            $filter = $body;
            unset($filter['_count_only'], $filter['_sum']);
            if (count($filter) > 0) {
                $built = build_filter_sql($conn, $filter, $params);
                $whereSql = $built['where'];
                if ($built['order_by']) $orderBy = $built['order_by'];
                if ($built['limit']) $limit = $built['limit'];
            }
        }

        if ($countOnly) {
            $sql = "SELECT COUNT(*) AS total FROM `$table`";
            if (count($whereSql) > 0) $sql .= ' WHERE ' . implode(' AND ', $whereSql);
            $result = execute_query($conn, $sql, $params);
            $row = $result ? $result->fetch_assoc() : null;
            echo json_encode(['status' => 'success', 'data' => [['total' => (int) ($row['total'] ?? 0)]], 'count' => 1]);
            break;
        }

        if (!empty($sumColumn)) {
            $sumCol = safe_ident($sumColumn);
            if (!in_array($sumCol, ['amount', 'balance', 'cost', 'qty'], true)) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Column not available for public aggregation']);
                break;
            }
            $sql = "SELECT COALESCE(SUM(`$sumCol`), 0) AS total FROM `$table`";
            if (count($whereSql) > 0) $sql .= ' WHERE ' . implode(' AND ', $whereSql);
            $result = execute_query($conn, $sql, $params);
            $row = $result ? $result->fetch_assoc() : null;
            echo json_encode(['status' => 'success', 'data' => [['total' => (float) ($row['total'] ?? 0)]], 'count' => 1]);
            break;
        }

        $sql = "SELECT * FROM `$table`";
        if (count($whereSql) > 0) $sql .= ' WHERE ' . implode(' AND ', $whereSql);
        if (!empty($orderBy)) $sql .= ' ' . $orderBy;
        if (!empty($limit)) $sql .= ' LIMIT ' . (int) $limit;

        $result = execute_query($conn, $sql, $params);
        $rows = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) $rows[] = $row;
        }
        // The public login page reads "companies" (mapped to accounts). Merge
        // admin-saved branding so logo_url is the real uploaded logo.
        if ($table === 'accounts' && count($rows) > 0) {
            $rows = augment_accounts_branding($rows);
        }
        echo json_encode(['status' => 'success', 'data' => $rows, 'count' => count($rows)]);
        break;
    }

    // =======================================================================
    case 'create':
        require_auth();
        $table = safe_ident($_GET['table'] ?? '');
        if ($table === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'table required']);
            break;
        }
        // "companies" is a virtual table: branding lives in local/company-config.json,
        // NOT in the real Invoice Ninja `companies` (billing) table. Persist overrides
        // locally so real data is never mutated.
        if ($table === 'companies') {
            $data = request_body();
            $saved = write_local_company_config($data);
            if ($saved === null) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Could not persist company config']);
            } else {
                echo json_encode(['status' => 'success', 'id' => (string) ($saved['id'] ?? 1), 'data' => $saved, 'count' => 1]);
            }
            break;
        }
        $data = request_body();
        if (!is_array($data) || count($data) === 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No data provided']);
            break;
        }

        // Work with the database columns: drop app-only keys and inject
        // defaults for required Invoice Ninja columns (public_id, tax_rate1/2...)
        $data = schema_write_filter($conn, $table, $data, true);
        if (count($data) === 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No writable columns for table ' . $table]);
            break;
        }

        $columns = [];
        $placeholders = [];
        $params = [];
        foreach ($data as $key => $value) {
            $columns[] = '`' . safe_ident($key) . '`';
            $placeholders[] = '?';
            $params[] = is_array($value) || is_object($value) ? json_encode($value) : $value;
        }

        $sql = "INSERT INTO `$table` (" . implode(', ', $columns) . ') VALUES (' . implode(', ', $placeholders) . ')';
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'SQL prepare failed: ' . $conn->error]);
            break;
        }
        $types = '';
        foreach ($params as $p) {
            if (is_int($p) || (is_string($p) && preg_match('/^-?\d+$/', $p))) $types .= 'i';
            elseif (is_float($p)) $types .= 'd';
            else $types .= 's';
        }
        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Insert failed: ' . $stmt->error]);
            $stmt->close();
            break;
        }
        $newId = $stmt->insert_id;
        $stmt->close();
        echo json_encode(['status' => 'success', 'id' => (string) $newId, 'data' => ['id' => (string) $newId]]);
        break;

    // =======================================================================
    case 'update':
        require_auth();
        $table = safe_ident($_GET['table'] ?? '');
        if ($table === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'table required']);
            break;
        }
        // "companies" is a virtual table (see create): persist branding overrides
        // to local/company-config.json instead of the real billing table so
        // real data is never mutated.
        if ($table === 'companies') {
            $data = request_body();
            if (!is_array($data) || count($data) === 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'No data provided']);
                break;
            }
            $saved = write_local_company_config($data);
            if ($saved === null) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Could not persist company config']);
            } else {
                echo json_encode(['status' => 'success', 'data' => $saved, 'affected' => 1, 'count' => 1]);
            }
            break;
        }
        $data = request_body();
        if (!is_array($data) || count($data) === 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No data provided']);
            break;
        }

        $whereParam = $_GET['where'] ?? ($_POST['where'] ?? '');
        $built = build_where_from_string($conn, $whereParam);
        if (count($built['where']) === 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'where clause required for update']);
            break;
        }

        // Work with the database columns: drop app-only keys so UPDATE succeeds
        // against the real schema. Defaults are NOT injected on update.
        $data = schema_write_filter($conn, $table, $data, false);
        if (count($data) === 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No writable columns for table ' . $table]);
            break;
        }

        $sets = [];
        $params = [];
        foreach ($data as $key => $value) {
            $sets[] = '`' . safe_ident($key) . '` = ?';
            $params[] = is_array($value) || is_object($value) ? json_encode($value) : $value;
        }
        $params = array_merge($params, $built['params']);

        $sql = "UPDATE `$table` SET " . implode(', ', $sets) . ' WHERE ' . implode(' AND ', $built['where']);
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'SQL prepare failed: ' . $conn->error]);
            break;
        }
        $types = '';
        foreach ($params as $p) {
            if (is_int($p) || (is_string($p) && preg_match('/^-?\d+$/', $p))) $types .= 'i';
            elseif (is_float($p)) $types .= 'd';
            else $types .= 's';
        }
        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $stmt->error]);
            $stmt->close();
            break;
        }
        $affected = $stmt->affected_rows;
        $stmt->close();
        echo json_encode(['status' => 'success', 'affected' => $affected]);
        break;

    // =======================================================================
    case 'delete':
        require_auth();
        $table = safe_ident($_GET['table'] ?? '');
        if ($table === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'table required']);
            break;
        }

        $whereParam = $_GET['where'] ?? ($_POST['where'] ?? '');
        $built = build_where_from_string($conn, $whereParam);
        if (count($built['where']) === 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'where clause required for delete']);
            break;
        }

        $sql = "DELETE FROM `$table` WHERE " . implode(' AND ', $built['where']);
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'SQL prepare failed: ' . $conn->error]);
            break;
        }
        $types = '';
        foreach ($built['params'] as $p) {
            if (is_int($p) || (is_string($p) && preg_match('/^-?\d+$/', $p))) $types .= 'i';
            elseif (is_float($p)) $types .= 'd';
            else $types .= 's';
        }
        if ($types !== '') $stmt->bind_param($types, ...$built['params']);
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Delete failed: ' . $stmt->error]);
            $stmt->close();
            break;
        }
        $affected = $stmt->affected_rows;
        $stmt->close();
        echo json_encode(['status' => 'success', 'affected' => $affected]);
        break;

    // =======================================================================
    // Delete an invoice with cascade (transaction-safe).
    // Deletes invoice_items, payment_allocations, payments and the invoice
    // itself in a single transaction. Used by the frontend useDeleteInvoice.
    // =======================================================================
    case 'delete_invoice_with_cascade':
        require_auth();
        $body = request_body();
        $invoiceId = $body['invoice_id'] ?? null;
        if ($invoiceId === null || $invoiceId === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'invoice_id required']);
            break;
        }
        $invoiceIdInt = (int) $invoiceId;
        if ($invoiceIdInt <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'invalid invoice_id']);
            break;
        }

        $conn->begin_transaction();
        $ok = true;
        $err = '';
        $tables = ['invoice_items', 'payment_allocations', 'payments', 'invoices'];
        foreach ($tables as $t) {
            $stmt = $conn->prepare("DELETE FROM `$t` WHERE invoice_id = ?");
            if (!$stmt) {
                $ok = false;
                $err = $conn->error;
                break;
            }
            $stmt->bind_param('i', $invoiceIdInt);
            if (!$stmt->execute()) {
                $ok = false;
                $err = $stmt->error;
                $stmt->close();
                break;
            }
            $stmt->close();
        }
        if ($ok) {
            $conn->commit();
            echo json_encode(['status' => 'success', 'affected' => 1]);
        } else {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Cascade delete failed: ' . $err]);
        }
        break;

    // =======================================================================
    // Generate the next sequential document number.
    // Body: { type: "INV", date?: "YYYY-MM-DD" }  (type is the 3-letter code:
    //   INV, PRO, QT, PO, LPO, DN, CN, PAY, REC)
    // Response: { success, number: "TYPE-DDMMYYYY-N", type, date, sequence }
    // Uses the document_sequences table (unique per type + year) with an
    // atomic increment so concurrent requests never collide.
    // =======================================================================
    case 'get_next_document_number':
        $body = request_body();
        $typeRaw = trim($body['type'] ?? '');
        $type = strtoupper($typeRaw);
        $validTypes = ['INV', 'PRO', 'QT', 'PO', 'LPO', 'DN', 'CN', 'PAY', 'REC'];
        if ($type === '' || !in_array($type, $validTypes, true)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid or missing document type. Expected one of: ' . implode(', ', $validTypes)]);
            break;
        }

        // Resolve the generation date (defaults to today).
        $date = trim($body['date'] ?? '');
        if ($date === '') {
            $date = date('Y-m-d');
        }
        $ts = strtotime($date);
        if ($ts === false) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid date format. Use YYYY-MM-DD.']);
            break;
        }
        $year = (int) date('Y', $ts);
        $dateStamp = date('dmY', $ts);

        // Atomic increment: seed with 1, then bump by 1 every call.
        $conn->begin_transaction();
        $stmt = $conn->prepare(
            "INSERT INTO document_sequences (document_type, year, sequence_number)
             VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE sequence_number = LAST_INSERT_ID(sequence_number + 1)"
        );
        if (!$stmt) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
            break;
        }
        $stmt->bind_param('si', $type, $year);
        if (!$stmt->execute()) {
            $err = $stmt->error;
            $stmt->close();
            $conn->rollback();
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Sequence update failed: ' . $err]);
            break;
        }
        // affected_rows: 1 = fresh row (sequence 1), 2 = row updated (use
        // LAST_INSERT_ID which carries the incremented sequence value).
        $sequence = $stmt->affected_rows === 2 ? (int) $conn->insert_id : 1;
        $stmt->close();
        $conn->commit();

        $number = $type . '-' . $dateStamp . '-' . $sequence;
        echo json_encode([
            'status' => 'success',
            'success' => true,
            'number' => $number,
            'type' => $type,
            'date' => $dateStamp,
            'sequence' => $sequence,
        ]);
        break;
    // branding merged with any admin-saved overrides (logo, colors, etc.)
    // from local/company-config.json. Used by the public website + login page.
    // =======================================================================
    case 'company_config':
        $cfg = read_local_company_config();
        echo json_encode(['status' => 'success', 'data' => $cfg, 'count' => 1]);
        break;

    // =======================================================================
    case 'raw':
        require_auth();
        $body = request_body();
        $sql = $body['sql'] ?? '';
        $params = $body['params'] ?? [];
        if (trim($sql) === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'sql required']);
            break;
        }
        // Only allow SELECT for raw to avoid accidental data modification
        $upper = strtoupper(trim($sql));
        if (strpos($upper, 'SELECT') !== 0 && strpos($upper, 'SHOW') !== 0 && strpos($upper, 'DESCRIBE') !== 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'raw action only supports SELECT/SHOW/DESCRIBE']);
            break;
        }
        $result = execute_query($conn, $sql, $params);
        $rows = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) $rows[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $rows]);
        break;

    // =======================================================================
    case 'change_password':
        require_auth();
        handle_change_password($conn, request_body());
        break;

    // =======================================================================
    case 'rpc':
        require_auth();
        $body = request_body();
        $fn = $body['function'] ?? $body['name'] ?? null;
        // Merge the nested params object into the body so handlers read flat fields
        if (isset($body['params']) && is_array($body['params'])) {
            $body = array_merge($body, $body['params']);
        }
        if ($fn === 'change_password') {
            handle_change_password($conn, $body);
            break;
        }
        echo json_encode(['status' => 'error', 'message' => 'Unknown RPC function: ' . $fn]);
        break;

    // =======================================================================
    // File upload (image/document) -> stored in public/uploads/ (served by web server).
    // Auth required. Strict validation: only safe extensions, size-limited.
    // =======================================================================
    case 'upload_file': {
        require_auth();

        $uploadDir = __DIR__ . '/public/uploads';
        if (!is_dir($uploadDir)) {
            if (!@mkdir($uploadDir, 0777, true) && !is_dir($uploadDir)) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Could not create upload directory']);
                break;
            }
        }

        if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No file provided']);
            break;
        }

        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Upload error: ' . $file['error']]);
            break;
        }

        // Validate size (10MB max)
        if ($file['size'] > 10 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'File size exceeds 10MB limit']);
            break;
        }

        // Validate extension + mime
        $allowed = [
            'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png',
            'gif' => 'image/gif', 'webp' => 'image/webp',
            'pdf' => 'application/pdf', 'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'txt' => 'text/plain', 'csv' => 'text/csv',
        ];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!$ext || !isset($allowed[$ext])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'File type not allowed']);
            break;
        }

        // Build a safe, unique filename
        $base = preg_replace('/[^A-Za-z0-9._-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
        if ($base === '') $base = 'file';
        $unique = uniqid('img_', true);
        $safeName = $unique . ($ext ? '.' . $ext : '');
        $dest = $uploadDir . '/' . $safeName;
        $relPath = 'public/uploads/' . $safeName;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to save uploaded file']);
            break;
        }

        // Build absolute public URL (script-relative base dir)
        $scheme = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') ? 'https' : 'http';
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '/api.php';
        $baseDir = rtrim(dirname($scriptName), '/\\');
        if ($baseDir === '' || $baseDir === '/') $baseDir = '';
        $url = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? '') . $baseDir . '/' . $relPath;

        echo json_encode([
            'status' => 'success',
            'url' => $url,
            'path' => $relPath,
            'name' => $safeName,
            'size' => $file['size'],
            'mime' => $file['type'],
        ]);
        break;
    }

    // =======================================================================
    // Delete an uploaded file. Auth required. Confined to public/uploads/
    // to prevent path traversal outside the upload directory.
    // =======================================================================
    case 'delete_file': {
        require_auth();
        $body = request_body();
        $relPath = $body['path'] ?? '';
        if (!is_string($relPath) || $relPath === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'path required']);
            break;
        }

        $uploadDir = realpath(__DIR__ . '/public/uploads');
        if ($uploadDir === false) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Upload directory not found']);
            break;
        }

        // `path` is relative to the project root (e.g. public/uploads/<name>).
        // Resolve against the project root, then confirm it stays inside uploads.
        $dest = realpath(__DIR__ . '/' . $relPath);
        if ($dest === false || strpos($dest, $uploadDir) !== 0) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Invalid file path']);
            break;
        }

        if (!@unlink($dest)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to delete file']);
            break;
        }

        echo json_encode(['status' => 'success', 'message' => 'File deleted']);
        break;
    }

    // =======================================================================
    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Unknown action: ' . $action]);
        break;
}

$conn->close();
