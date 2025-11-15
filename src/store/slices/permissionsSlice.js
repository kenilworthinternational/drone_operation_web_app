import { createSlice } from '@reduxjs/toolkit';

export const PERMISSIONS_STORAGE_KEY = 'nav_permissions';

const ALL_ROLES = ['ceo', 'md', 'mgr', 'ops', 'dops', 'fd', 'io', 'wt'];

const createDefaultState = () => ({
  categories: {
    Corporate: ['ceo', 'md', 'dops'],
    Management: ['md', 'mgr', 'dops'],
    OpsRoom: ['md', 'mgr', 'ops', 'dops'],
    Finance: ['md', 'mgr', 'fd', 'dops'],
    Inventory: ['md', 'io', 'mgr', 'dops'],
    Workshop: ['md', 'wt', 'mgr', 'dops'],
    'HR and Admin': ['md', 'mgr', 'dops'],
    'ICT - System Admin': ['md', 'dops'],
  },
  roles: ALL_ROLES,
});

const normalizeState = (state) => {
  const fallback = createDefaultState();
  const rawRoles = Array.from(
    new Set([...(state.roles || []), ...fallback.roles].map((role) => role.toLowerCase()))
  );
  const roles = rawRoles.filter((role) => ALL_ROLES.includes(role));

  const categories = Object.fromEntries(
    Object.entries({ ...fallback.categories, ...(state.categories || {}) }).map(([category, values]) => {
      const normalized = Array.from(
        new Set(
          (values || [])
            .map((role) => role.toLowerCase())
            .filter((role) => roles.includes(role))
        )
      );
      return [category, normalized];
    })
  );

  return {
    categories,
    roles,
  };
};

const loadState = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return createDefaultState();
  }

  try {
    const serialized = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (!serialized) {
      return createDefaultState();
    }
    const parsed = JSON.parse(serialized);
    return normalizeState(parsed);
  } catch (error) {
    console.warn('Failed to load navigation permissions:', error);
    return createDefaultState();
  }
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState: loadState(),
  reducers: {
    togglePermission: (state, action) => {
      const { category, role } = action.payload;
      const normalizedRole = String(role || '').toLowerCase();

      if (!normalizedRole) {
        return;
      }

      if (!state.categories[category]) {
        state.categories[category] = [];
      }

      const current = state.categories[category];
      const exists = current.includes(normalizedRole);

      state.categories[category] = exists
        ? current.filter((item) => item !== normalizedRole)
        : [...current, normalizedRole];
    },
    setCategoryRoles: (state, action) => {
      const { category, roles } = action.payload;
      state.categories[category] = Array.from(
        new Set((roles || []).map((role) => String(role).toLowerCase()))
      );
    },
    resetPermissions: () => createDefaultState(),
  },
});

export const { togglePermission, setCategoryRoles, resetPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;

