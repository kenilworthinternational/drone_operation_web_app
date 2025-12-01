import { baseApi } from '../baseApi';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Node.js Backend Base URL Configuration
const getNodeBackendUrl = () => {
  const hostname = window.location.hostname;
  
  // If running locally, check if local backend is available, otherwise use dev server
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For local development, you can change this to 'http://localhost:3002' if backend is running locally
    // Otherwise, use the dev server
    return 'https://dsms-web-api-dev.kenilworthinternational.com';
  }
  
  // Check if we're on the dev server (dsms-web-api-dev)
  if (hostname.includes('dev') || hostname.includes('kenilworthinternational.com')) {
    return 'https://dsms-web-api-dev.kenilworthinternational.com';
  }
  
  // Check if we're on the test server
  if (hostname.includes('test')) {
    return 'https://dsms-api-test.kenilworth.international.com';
  }
  
  return 'https://dsms-api.kenilworth.international.com';
};

// Helper function to get token
const getToken = () => {
  const storedUser = JSON.parse(localStorage.getItem('userData'));
  return storedUser?.token || null;
};

// Custom base query for Node.js backend
const nodeBackendBaseQuery = fetchBaseQuery({
  baseUrl: getNodeBackendUrl(),
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const stockAssetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // SUPPLIERS
    // =====================================================
    getSuppliers: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/suppliers',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Suppliers'],
    }),

    getSupplier: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/suppliers/view',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'Suppliers', id }],
    }),

    createSupplier: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/suppliers/create',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Suppliers'],
    }),

    updateSupplier: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/suppliers/update',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: (result, error, data) => [
        { type: 'Suppliers', id: data?.id },
        'Suppliers'
      ],
    }),


    // =====================================================
    // MAIN CATEGORIES
    // =====================================================
    getMainCategories: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/main-categories',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['MainCategories'],
    }),

    getMainCategory: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/main-categories/view',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'MainCategories', id }],
    }),

    createMainCategory: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/main-categories/create',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['MainCategories'],
    }),

    updateMainCategory: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/main-categories/update',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: (result, error, data) => [
        { type: 'MainCategories', id: data?.id },
        'MainCategories'
      ],
    }),


    // =====================================================
    // SUB CATEGORIES
    // =====================================================
    getSubCategories: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/sub-categories',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['SubCategories'],
    }),

    getSubCategory: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/sub-categories/view',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'SubCategories', id }],
    }),

    createSubCategory: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/sub-categories/create',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['SubCategories'],
    }),

    updateSubCategory: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/sub-categories/update',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: (result, error, data) => [
        { type: 'SubCategories', id: data?.id },
        'SubCategories'
      ],
    }),


    // =====================================================
    // INVENTORY ITEMS
    // =====================================================
    getInventoryItems: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/inventory-items',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['InventoryItems'],
    }),

    getInventoryItem: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/inventory-items/view',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'InventoryItems', id }],
    }),

    createInventoryItem: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/inventory-items/create',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['InventoryItems'],
    }),

    updateInventoryItem: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/inventory-items/update',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: (result, error, data) => [
        { type: 'InventoryItems', id: data?.id },
        'InventoryItems'
      ],
    }),

  }),
});

// Export hooks for usage in functional components
export const {
  // Suppliers
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  // Main Categories
  useGetMainCategoriesQuery,
  useGetMainCategoryQuery,
  useCreateMainCategoryMutation,
  useUpdateMainCategoryMutation,
  // Sub Categories
  useGetSubCategoriesQuery,
  useGetSubCategoryQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  // Inventory Items
  useGetInventoryItemsQuery,
  useGetInventoryItemQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
} = stockAssetsApi;

