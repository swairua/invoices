/**
 * Utility to fix admin role permissions.
 * Ensures the admin role has all necessary permissions including view_inventory.
 *
 * NOTE: This app is migrated to the external API (api.php) and no longer uses
 * the Supabase `roles` table. Admin permissions are enforced in-memory via
 * DEFAULT_ROLE_PERMISSIONS.admin (which already includes view_inventory).
 * These functions therefore treat a missing roles table / missing admin role as
 * "permission granted" so the restrictive banner never blocks admins, while
 * still supporting environments that maintain a real `roles` table.
 */
import { getDatabase } from '@/integrations/database';
import {
  DEFAULT_ROLE_PERMISSIONS,
  Permission,
} from '@/types/permissions';
import { normalizePermissions } from '@/utils/permissionChecker';

export interface FixRolePermissionsResult {
  success: boolean;
  message: string;
  role?: any;
  addedPermissions?: string[];
  error?: string;
}

const isMissingTableError = (msg: string) =>
  /doesn't exist|doesn`t exist|table .* doesn't exist|Base table or view not found|1146|42S02/i.test(
    msg || ''
  );

function roleHasPermission(role: any, permission: Permission): boolean {
  if (!role) return false;
  let perms = role.permissions || [];
  if (typeof perms === 'string') {
    try {
      perms = JSON.parse(perms);
    } catch {
      perms = [];
    }
  }
  return Array.isArray(perms) && perms.includes(permission);
}

function normalizeRolePermissions(role: any) {
  if (!role) return role;
  return { ...role, permissions: normalizePermissions(role.permissions) };
}

export async function checkAdminInventoryPermission(companyId: string): Promise<{
  hasPermission: boolean;
  role: any | null;
  error?: string;
}> {
  try {
    const db = getDatabase();
    const result = await db.select('roles', {
      name: 'admin',
      ...(companyId ? { company_id: companyId } : {}),
    });

    if (result.error) {
      const msg =
        result.error instanceof Error ? result.error.message : String(result.error);

      // If the roles table doesn't exist, admin permissions are enforced by the
      // in-memory defaults (admin always has view_inventory). Don't block the UI.
      if (isMissingTableError(msg)) {
        return {
          hasPermission: true,
          role: null,
        };
      }
    }

    const adminRole = result.data?.[0] || null;

    if (!adminRole) {
      // No stored role: rely on the default admin policy (includes view_inventory).
      return {
        hasPermission: Array.isArray(DEFAULT_ROLE_PERMISSIONS.admin)
          ? DEFAULT_ROLE_PERMISSIONS.admin.includes('view_inventory')
          : true,
        role: null,
      };
    }

    return {
      hasPermission: roleHasPermission(adminRole, 'view_inventory'),
      role: normalizeRolePermissions(adminRole),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    if (isMissingTableError(errorMessage)) {
      return { hasPermission: true, role: null };
    }
    return { hasPermission: false, role: null, error: errorMessage };
  }
}

export async function fixAdminRolePermissions(
  companyId: string
): Promise<FixRolePermissionsResult> {
  try {
    const db = getDatabase();

    // Look up the admin role (read-only).
    const result = await db.select('roles', {
      name: 'admin',
      ...(companyId ? { company_id: companyId } : {}),
    });

    if (result.error) {
      const msg =
        result.error instanceof Error ? result.error.message : String(result.error);

      // Roles table absent: permissions are governed by DEFAULT_ROLE_PERMISSIONS,
      // which already includes view_inventory for admins. Nothing to fix.
      if (isMissingTableError(msg)) {
        return {
          success: true,
          message:
            'Admin permissions are enforced by default policy and already include inventory access.',
        };
      }
    }

    const adminRole = result.data?.[0] || null;

    if (!adminRole) {
      return {
        success: true,
        message:
          'Admin role uses default permissions (including inventory access). No stored role to update.',
      };
    }

    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS.admin;
    const currentPermissions = normalizePermissions(adminRole.permissions) ?? [];
    const missing = defaultPermissions.filter(
      (p) => !currentPermissions.includes(p)
    );

    if (missing.length === 0) {
      return {
        success: true,
        message: 'Admin role already has all permissions',
        role: normalizeRolePermissions(adminRole),
        addedPermissions: [],
      };
    }

    // Add the missing permissions to the stored admin role.
    const { error: updateError } = await db.update(
      'roles',
      String(adminRole.id),
      {
        permissions: [...currentPermissions, ...missing],
        updated_at: new Date().toISOString(),
      }
    );

    if (updateError) {
      return {
        success: false,
        message: 'Could not update admin role permissions',
        error:
          updateError instanceof Error
            ? updateError.message
            : String(updateError),
      };
    }

    return {
      success: true,
      message: `Successfully added ${missing.length} missing permissions to admin role`,
      addedPermissions: missing,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: 'Unexpected error while fixing admin role permissions',
      error: errorMessage,
    };
  }
}
