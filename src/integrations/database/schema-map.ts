/**
 * Schema Mapping Layer
 * Maps the app's domain table/column names onto the raw Invoice Ninja schema
 * (imported from hycmvsgn_heal.sql) plus the added app tables.
 *
 * Read-only: real data tables map to their raw equivalents. The mapping never
 * rewrites table names on write paths, so app writes stay on the added tables
 * and can never modify the existing real data.
 *
 * NATIVE-SCHEMA MODE: the live backend (fweafrmr_med) speaks the app's domain
 * names directly (companies, customers, quotations, ...), so every mapping
 * below is bypassed and rows pass through with only null-safe aliasing.
 * Local dev against the Invoice Ninja import (hycmvsgn_heal) keeps the
 * mappings. Enabled via VITE_NATIVE_SCHEMA=true, or automatically when the
 * API URL points at diagsolutionsltd.com (set by ExternalAPIAdapter).
 */

// ---------------------------------------------------------------------------
// Native-schema mode flag (live backend speaks domain names directly)
// ---------------------------------------------------------------------------
let nativeSchemaMode = false;

export function setNativeSchemaMode(enabled: boolean): void {
  nativeSchemaMode = enabled;
}

export function isNativeSchema(): boolean {
  if (nativeSchemaMode) return true;
  try {
    const flag = import.meta.env?.VITE_NATIVE_SCHEMA;
    if (typeof flag === 'string') return flag.toLowerCase() === 'true';
  } catch {
    // import.meta unavailable (tests/SSR) - fall back to the explicit flag
  }
  return false;
}

// ---------------------------------------------------------------------------
// Table name mapping (READ only)
// ---------------------------------------------------------------------------
const READ_TABLE_MAP: Record<string, string> = {
  customers: 'clients',
  suppliers: 'vendors',
  companies: 'accounts',
  profiles: 'users',
  quotations: 'invoices',
  quotation_items: 'invoice_items',
};

export function mapReadTable(table: string): string {
  if (isNativeSchema()) return table;
  return READ_TABLE_MAP[table] || table;
}

// ---------------------------------------------------------------------------
// Filter key mapping (READ only) - maps app filter keys to raw columns
// ---------------------------------------------------------------------------
const FILTER_KEY_MAP: Record<string, Record<string, string>> = {
  clients: { company_id: 'account_id' },
  invoices: { company_id: 'account_id', customer_id: 'client_id' },
  invoice_items: { company_id: 'account_id', customer_id: 'client_id', invoice_id: 'invoice_id', quotation_id: 'invoice_id' },
  products: { company_id: 'account_id' },
  payments: { company_id: 'account_id', customer_id: 'client_id' },
  vendors: { company_id: 'account_id' },
  contacts: { company_id: 'account_id', customer_id: 'client_id' },
  users: { company_id: 'account_id' },
  credits: { company_id: 'account_id', customer_id: 'client_id' },
};

export function mapReadFilter(table: string, filter?: Record<string, any>): Record<string, any> | undefined {
  if (isNativeSchema()) return filter;
  if (!filter || typeof filter !== 'object') {
    // Even with empty filter, quotations need invoice_type_id=2
    if (table === 'quotations') {
      return { invoice_type_id: 2 };
    }
    return filter;
  }
  const mappedTable = mapReadTable(table);
  const keyMap = FILTER_KEY_MAP[mappedTable] || {};
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(filter)) {
    out[keyMap[key] || key] = value;
  }
  // Quotations are stored in the invoices table with invoice_type_id=2
  if (table === 'quotations') {
    out['invoice_type_id'] = 2;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Invoice Ninja numeric status -> app string status
// Real hycmvsgn_heal.invoice_statuses table:
//   1 draft, 2 sent, 3 viewed, 4 approved, 5 partial, 6 paid
// ---------------------------------------------------------------------------
const INVOICE_STATUS_MAP: Record<string, string> = {
  '1': 'draft',
  '2': 'sent',
  '3': 'viewed',
  '4': 'approved',
  '5': 'partial',
  '6': 'paid',
};

// Reverse map: app string status -> Invoice Ninja numeric status
const INVOICE_STATUS_ID_MAP: Record<string, number> = {
  draft: 1,
  sent: 2,
  viewed: 3,
  approved: 4,
  partial: 5,
  paid: 6,
};

// ---------------------------------------------------------------------------
// Write column mapping (WRITE path)
// Maps app column names onto the raw Invoice Ninja column names so UPDATE /
// INSERT statements succeed against the real tables. Keys mapped to `null`
// are app-only derived values that have no real column and must be dropped.
// Columns not listed are passed through unchanged.
// ---------------------------------------------------------------------------
const WRITE_COLUMN_MAP: Record<string, Record<string, string | null>> = {
  invoices: {
    company_id: 'account_id',
    customer_id: 'client_id',
    created_by: 'user_id',
    total_amount: 'amount',
    total: 'amount',
    balance_due: 'balance',
    paid_amount: null, // derived: balance = amount - paid
    status: 'invoice_status_id',
    subtotal: null, // not a real column (computed from items)
    tax_amount: null, // not a real column (computed from items)
    lpo_number: 'po_number',
    notes: 'public_notes',
    terms_and_conditions: 'terms',
    quotation_id: 'quote_id',
  },
  invoice_items: {
    company_id: 'account_id',
    created_by: 'user_id',
    description: 'notes',
    name: 'product_key',
    quantity: 'qty',
    unit_price: 'cost',
    line_total: null, // computed: qty * cost
    tax_amount: null, // not a real column
    tax_inclusive: null, // not a real column
    tax_percentage: 'tax_rate1',
    discount_percentage: 'discount',
    sort_order: null, // not a real column
  },
  payments: {
    company_id: 'account_id',
    customer_id: 'client_id',
    created_by: 'user_id',
    payment_number: null, // derived: PAY-{id} on read
    payment_method: null, // not a real column (payment_type_id FK)
    reference_number: 'transaction_reference',
    notes: 'private_notes',
  },
  products: {
    company_id: 'account_id',
    created_by: 'user_id',
    name: 'product_key',
    sku: 'product_key',
    description: 'notes',
    cost_price: 'cost',
    unit_price: 'cost',
    selling_price: 'cost',
    stock_quantity: 'qty',
    quantity: 'qty',
    category_id: null, // not a real column
    reorder_level: null, // not a real column
    status: null, // not a real column
  },
  clients: {
    company_id: 'account_id',
    created_by: 'user_id',
    phone: 'work_phone',
    address: 'address1',
    tax_id: 'vat_number',
    tax_number: 'vat_number',
    customer_number: null,
    customer_code: null,
    email: null, // belongs to contacts table
    status: null,
    credit_limit: null,
    is_supplier: null,
  },
  credits: {
    company_id: 'account_id',
    customer_id: 'client_id',
    created_by: 'user_id',
    total_amount: 'amount',
    balance_due: 'balance',
    credit_note_number: 'credit_number',
    credit_note_date: 'credit_date',
    notes: 'public_notes',
    applied_amount: null, // computed
    affects_inventory: null,
    reason: null,
  },
  contacts: {
    company_id: 'account_id',
    customer_id: 'client_id',
    created_by: 'user_id',
  },
  // -------------------------------------------------------------------------
  // App-added tables: real DB schema is simpler than the UI form payloads.
  // Columns not listed here are dropped server-side by the schema-aware
  // filter; these mappings preserve data by renaming onto real columns.
  // -------------------------------------------------------------------------
  delivery_notes: {
    delivery_number: 'delivery_note_number',
  },
  delivery_note_items: {
    quantity_ordered: null,
    quantity_delivered: 'quantity',
    unit_of_measure: null,
    unit_price: null,
    sort_order: null,
  },
  credit_notes: {
    amount: 'total_amount',
    subtotal: null,
    tax_amount: null,
    balance: null,
    applied_amount: null,
    affects_inventory: null,
    credit_note_date: null,
    reason: null,
    notes: null,
    terms_and_conditions: null,
    created_by: null,
  },
  credit_note_items: {
    tax_percentage: null,
    tax_amount: null,
    tax_inclusive: null,
    tax_setting_id: null,
    sort_order: null,
  },
  customer_credit_balances: {
    credit_amount: 'credit_balance',
    source_receipt_id: null,
    source_payment_id: null,
    applied_invoice_id: null,
    status: null,
    notes: null,
  },
  remittance_advice: {
    customer_id: 'supplier_id',
    advice_number: 'remittance_number',
    advice_date: 'remittance_date',
    total_payment: 'total_amount',
    status: null,
    notes: null,
    created_by: null,
  },
  remittance_advice_items: {
    remittance_advice_id: 'remittance_id',
    document_number: 'invoice_number',
    document_date: 'invoice_date',
    payment_amount: 'amount',
    document_type: null,
    invoice_amount: null,
    credit_amount: null,
    sort_order: null,
  },
  proforma_invoices: {
    created_by: null,
  },
  proforma_items: {
    discount_percentage: null,
    discount_amount: null,
    tax_inclusive: null,
    sort_order: null,
  },
  quotation_items: {
    discount_percentage: null,
  },
  payment_methods: {
    company_id: 'account_id',
    code: null,
    name: null,
    description: null,
    icon_name: null,
  },
};

// ---------------------------------------------------------------------------
// Write value transforms - convert app values to raw column values
// ---------------------------------------------------------------------------
const WRITE_VALUE_TRANSFORMS: Record<string, Record<string, (value: any) => any>> = {
  invoices: {
    status: (value) => {
      if (typeof value === 'string' && value.toLowerCase() in INVOICE_STATUS_ID_MAP) {
        return INVOICE_STATUS_ID_MAP[value.toLowerCase()];
      }
      return value;
    },
  },
};

// ---------------------------------------------------------------------------
// Write table mapping - real Invoice Ninja tables keep their raw names
// (app-added tables like customers/companies/proforma_invoices stay as-is).
// ---------------------------------------------------------------------------
const WRITE_TABLE_MAP: Record<string, string> = {};

export function mapWriteTable(table: string): string {
  return WRITE_TABLE_MAP[table] || table;
}

/**
 * Map app column names onto the raw Invoice Ninja schema for write operations.
 * Returns a new object with mapped keys, dropping app-only derived columns.
 */
export function mapWriteData(table: string, data?: Record<string, any>): Record<string, any> | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
  if (isNativeSchema()) return data;

  const columnMap = WRITE_COLUMN_MAP[table];
  const valueTransforms = WRITE_VALUE_TRANSFORMS[table];
  if (!columnMap && !valueTransforms) return data;

  const mapped: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const target = columnMap ? columnMap[key] : undefined;
    if (target === null) continue; // drop app-only derived column
    const finalKey = target || key;
    let finalValue = value;
    const transform = valueTransforms?.[key];
    if (transform) finalValue = transform(value);
    mapped[finalKey] = finalValue;
  }
  return mapped;
}

// ---------------------------------------------------------------------------
// Row column aliasing - keeps raw columns AND adds app-named aliases
// ---------------------------------------------------------------------------
export function mapRow(table: string, row: any): any {
  if (!row || typeof row !== 'object') return row;
  const rawTable = mapReadTable(table);
  const mapped: any = { ...row };

  switch (rawTable) {
    case 'customers':
      // Native-schema table (live backend). Real columns pass through;
      // only add the customer_code alias the app code expects.
      mapped.phone = row.phone ?? '';
      mapped.email = row.email ?? '';
      mapped.address = row.address ?? '';
      mapped.customer_code = row.customer_code ?? row.customer_number ?? '';
      if (mapped.is_active === undefined || mapped.is_active === null) {
        mapped.is_active = row.is_deleted == null || Number(row.is_deleted) === 0;
      }
      break;

    case 'clients':
      mapped.phone = row.work_phone ?? row.phone ?? '';
      mapped.company_id = row.account_id != null ? String(row.account_id) : row.company_id;
      mapped.email = row.email ?? '';
      mapped.address = row.address1 ?? row.address ?? '';
      mapped.customer_code = row.customer_code ?? row.id_number ?? row.vat_number ?? '';
      mapped.is_active = row.is_deleted == null || Number(row.is_deleted) === 0;
      break;

    case 'accounts': {
      mapped.email = row.work_email ?? row.email ?? '';
      mapped.phone = row.work_phone ?? row.phone ?? '';
      mapped.tax_number = row.vat_number ?? row.tax_number ?? '';
      mapped.address = row.address1 ?? row.address ?? '';
      mapped.country = row.country_id ?? row.country;
      // The real accounts.logo column holds a legacy bare filename (e.g.
      // "<account_key>.png") that no longer maps to a servable file. Only keep
      // logo_url when it is an actual servable URL/absolute path; otherwise drop
      // it so components fall back to the branded fallback logo instead of a
      // broken image. api.php augments these rows with the real admin-saved
      // logo_url, so this guard just catches any raw/legacy value.
      const accountsLogo = row.logo ?? row.logo_url ?? '';
      mapped.logo_url = accountsLogo && /^(https?:|data:|blob:|\/)/.test(accountsLogo) ? accountsLogo : '';
      break;
    }

    case 'users':
      mapped.full_name = `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || row.username || row.email || 'User';
      mapped.company_id = row.account_id ?? row.company_id;
      break;

    case 'vendors':
      mapped.phone = row.work_phone ?? row.phone ?? '';
      mapped.company_id = row.account_id ?? row.company_id;
      mapped.tax_number = row.vat_number ?? row.tax_number ?? '';
      mapped.address = row.address1 ?? row.address ?? '';
      break;

    case 'invoices':
      mapped.customer_id = row.client_id != null ? String(row.client_id) : row.customer_id;
      mapped.company_id = row.account_id != null ? String(row.account_id) : row.company_id;
      // Prefer native columns when present; fall back to Invoice Ninja ones
      mapped.total_amount = row.total_amount ?? row.amount ?? 0;
      mapped.total = row.total ?? row.amount ?? 0;
      mapped.balance_due = row.balance_due ?? row.balance ?? 0;
      mapped.paid_amount = row.paid_amount ?? ((Number(row.amount) || 0) - (Number(row.balance) || 0));
      mapped.subtotal = row.subtotal ?? (Number(row.amount) || 0);
      mapped.status = INVOICE_STATUS_MAP[String(row.invoice_status_id)] ?? row.status ?? 'sent';
      // Quotations are stored as invoices with invoice_type_id=2, but use different field names
      if (table === 'quotations') {
        mapped.quotation_number = row.invoice_number ?? row.quotation_number ?? '';
        mapped.quotation_date = row.invoice_date ?? row.quotation_date ?? null;
        mapped.valid_until = row.due_date ?? row.valid_until ?? null;
        mapped.tax_amount = row.tax_name1 ? parseFloat(row.tax_rate1) * Number(row.amount) / 100 : (row.tax_amount ?? 0);
        mapped.notes = row.public_notes ?? row.notes ?? '';
        mapped.terms_and_conditions = row.terms ?? row.terms_and_conditions ?? '';
      }
      break;

    case 'invoice_items':
      mapped.name = row.product_key ?? row.name ?? '';
      mapped.description = row.notes ?? row.description ?? row.product_key ?? '';
      mapped.quantity = row.qty ?? row.quantity ?? 0;
      mapped.unit_price = row.cost ?? row.unit_price ?? 0;
      mapped.line_total = row.line_total ?? ((Number(row.cost) || 0) * (Number(row.qty) || 0));
      break;

    case 'products':
      mapped.name = row.product_key ?? row.name ?? '';
      mapped.product_code = row.product_key ?? row.product_code ?? '';
      mapped.sku = row.product_key ?? row.sku ?? '';
      mapped.description = row.notes ?? row.description ?? '';
      mapped.cost_price = row.cost ?? row.cost_price ?? 0;
      mapped.stock_quantity = row.qty ?? row.stock_quantity ?? 0;
      mapped.quantity = row.qty ?? row.quantity ?? 0;
      // Native schema has unit_price as the selling price (no separate column)
      mapped.unit_price = row.unit_price ?? row.price ?? 0;
      mapped.selling_price = row.selling_price ?? row.unit_price ?? row.price ?? 0;
      mapped.reorder_level = row.reorder_level ?? 0;
      mapped.company_id = row.account_id ?? row.company_id;
      break;

    case 'payments':
      mapped.customer_id = row.client_id != null ? String(row.client_id) : row.customer_id;
      mapped.company_id = row.account_id != null ? String(row.account_id) : row.company_id;
      mapped.payment_number = row.payment_number ?? `PAY-${row.id}`;
      mapped.payment_method = row.payment_method ?? row.type ?? 'Cash';
      mapped.status = 'completed';
      break;

    case 'contacts':
      mapped.customer_id = row.client_id != null ? String(row.client_id) : row.customer_id;
      mapped.company_id = row.account_id != null ? String(row.account_id) : row.company_id;
      break;
  }

  return mapped;
}
