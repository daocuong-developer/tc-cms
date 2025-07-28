import { useAuth } from '../contexts/AuthContext';

export const useHasPermission = (codename: string): boolean => {
  const { hasPermission } = useAuth();
  return hasPermission(codename);
};

// Example usage:
// const canCreateUser = useHasPermission('user:create');
// if (canCreateUser) {
//   return <button>Create User</button>;
// }

export const useHasAnyPermission = (codenames: string[]): boolean => {
  const { hasPermission } = useAuth();
  return codenames.some(codename => hasPermission(codename));
};

// Example usage:
// const canManageUsers = useHasAnyPermission(['user:create', 'user:edit', 'user:delete']);
// if (canManageUsers) {
//   return <UserManagementPanel />;
// }

export const useHasAllPermissions = (codenames: string[]): boolean => {
  const { hasPermission } = useAuth();
  return codenames.every(codename => hasPermission(codename));
};

// Example usage:
// const isAdmin = useHasAllPermissions(['user:create', 'user:edit', 'user:delete']);
// if (isAdmin) {
//   return <AdminDashboard />;
// }
