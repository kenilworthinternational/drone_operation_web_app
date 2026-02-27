import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery, getNodeBackendUrl, getToken } from './nodeBackendConfig';

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


    getLastSupplierCode: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/suppliers/last-code',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        if (result.error) {
          return { error: result.error };
        }
        const lastCode = result.data?.data?.last_code ?? result.data?.last_code ?? null;
        return { data: { last_code: lastCode } };
      },
    }),

    // =====================================================
    // MAIN CATEGORIES
    // =====================================================
    getMainCategories: builder.query({
      queryFn: async (filters = {}) => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/stock-assets/main-categories',
              method: 'POST',
              body: filters,
            },
            {},
            {}
          );
          // Transform response to match expected structure
          if (result.error) {
            return { error: result.error };
          }
          
          // Backend returns { status: true, data: [...] }
          // When using queryFn, return { data: [...] } and RTK Query will make it available as the hook's data
          const categories = result.data?.data || result.data || [];
          return { data: categories };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
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

    getLastMainCategoryCode: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/main-categories/last-code',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        // Transform response to match expected structure
        if (result.error) {
          return { error: result.error };
        }
        // Backend returns { status: true, data: { last_code: "MAIN001" } }
        // Extract the last_code value directly
        const lastCode = result.data?.data?.last_code ?? result.data?.last_code ?? null;
        // Return in format that RTK Query expects: { data: { last_code: ... } }
        return { data: { last_code: lastCode } };
      },
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
        // Transform response to match expected structure
        if (result.error) {
          return { error: result.error };
        }
        // Backend returns { status: true, data: [...] }
        // RTK Query expects { data: [...] }
        return { data: result.data?.data || result.data || [] };
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
        // Check if data contains files (FormData)
        const isFormData = data instanceof FormData;
        
        // Prepare headers
        const headers = {};
        const token = getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Don't set Content-Type for FormData - browser will set it with boundary
        if (!isFormData) {
          headers['Content-Type'] = 'application/json';
        }
        
        // Make the request
        const baseUrl = getNodeBackendUrl();
        const response = await fetch(`${baseUrl}/api/stock-assets/sub-categories/create`, {
          method: 'POST',
          headers,
          body: isFormData ? data : JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          return { error: { status: response.status, data: result } };
        }
        return { data: result };
      },
      invalidatesTags: ['SubCategories'],
    }),

    updateSubCategory: builder.mutation({
      queryFn: async (data) => {
        // Check if data contains files (FormData)
        const isFormData = data instanceof FormData;
        
        // Prepare headers
        const headers = {};
        const token = getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Don't set Content-Type for FormData - browser will set it with boundary
        if (!isFormData) {
          headers['Content-Type'] = 'application/json';
        }
        
        // Make the request
        const baseUrl = getNodeBackendUrl();
        const response = await fetch(`${baseUrl}/api/stock-assets/sub-categories/update`, {
          method: 'POST',
          headers,
          body: isFormData ? data : JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          return { error: { status: response.status, data: result } };
        }
        return { data: result };
      },
      invalidatesTags: (result, error, data) => {
        // Handle both FormData and regular object
        const isFormData = data instanceof FormData;
        let id;
        if (isFormData) {
          // If FormData, id should already be appended
          id = data.get('id');
        } else {
          id = data?.id;
        }
        return [
          { type: 'SubCategories', id },
          'SubCategories'
        ];
      },
    }),

    getLastSubCategoryCode: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/sub-categories/last-code',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        // Transform response to match expected structure
        if (result.error) {
          return { error: result.error };
        }
        // Backend returns { status: true, data: { last_code: "SUB0001" } }
        // Extract the last_code value directly
        const lastCode = result.data?.data?.last_code ?? result.data?.last_code ?? null;
        // Return in format that RTK Query expects: { data: { last_code: ... } }
        return { data: { last_code: lastCode } };
      },
    }),

    // =====================================================
    // SUB-SUB CATEGORIES
    // =====================================================
    getSubSubCategories: builder.query({
      queryFn: async (filters = {}) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/sub-sub-categories',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data?.data || result.data || [] };
      },
      providesTags: ['SubSubCategories'],
    }),

    getSubSubCategory: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/sub-sub-categories/view',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'SubSubCategories', id }],
    }),

    createSubSubCategory: builder.mutation({
      queryFn: async (data) => {
        const isFormData = data instanceof FormData;
        const headers = {};
        const token = getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        if (!isFormData) {
          headers['Content-Type'] = 'application/json';
        }
        const baseUrl = getNodeBackendUrl();
        const response = await fetch(`${baseUrl}/api/stock-assets/sub-sub-categories/create`, {
          method: 'POST',
          headers,
          body: isFormData ? data : JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
          return { error: { status: response.status, data: result } };
        }
        return { data: result };
      },
      invalidatesTags: ['SubSubCategories'],
    }),

    updateSubSubCategory: builder.mutation({
      queryFn: async (data) => {
        const isFormData = data instanceof FormData;
        const headers = {};
        const token = getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        if (!isFormData) {
          headers['Content-Type'] = 'application/json';
        }
        const baseUrl = getNodeBackendUrl();
        const response = await fetch(`${baseUrl}/api/stock-assets/sub-sub-categories/update`, {
          method: 'POST',
          headers,
          body: isFormData ? data : JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
          return { error: { status: response.status, data: result } };
        }
        return { data: result };
      },
      invalidatesTags: (result, error, data) => {
        const isFormData = data instanceof FormData;
        let id;
        if (isFormData) {
          id = data.get('id');
        } else {
          id = data?.id;
        }
        return [
          { type: 'SubSubCategories', id },
          'SubSubCategories'
        ];
      },
    }),

    getLastSubSubCategoryCode: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/stock-assets/sub-sub-categories/last-code',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        if (result.error) {
          return { error: result.error };
        }
        const lastCode = result.data?.data?.last_code ?? result.data?.last_code ?? null;
        return { data: { last_code: lastCode } };
      },
    }),

    getLastItemCode: builder.query({
      queryFn: async (itemCategory) => {
        const baseUrl = getNodeBackendUrl();
        const url = `${baseUrl}/api/stock-assets/inventory-items/last-code?item_category=${itemCategory}`;
        const token = getToken();
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          return { error: { status: response.status, data: result } };
        }
        
        // Backend returns { status: true, data: { last_code: "ASSETS0001" } }
        // Extract the last_code value directly
        const lastCode = result?.data?.last_code ?? null;
        // Return in format that RTK Query expects: { data: { last_code: ... } }
        return { data: { last_code: lastCode } };
      },
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
        // Transform response to match expected structure
        if (result.error) {
          return { error: result.error };
        }
        // Backend returns { status: true, data: [...] }
        // RTK Query expects { data: [...] }
        return { data: result.data?.data || result.data || [] };
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
  useGetLastSupplierCodeQuery,
  // Main Categories
  useGetMainCategoriesQuery,
  useGetMainCategoryQuery,
  useCreateMainCategoryMutation,
  useUpdateMainCategoryMutation,
  useGetLastMainCategoryCodeQuery,
  // Sub Categories
  useGetSubCategoriesQuery,
  useGetSubCategoryQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useGetLastSubCategoryCodeQuery,
  // Sub-Sub Categories
  useGetSubSubCategoriesQuery,
  useGetSubSubCategoryQuery,
  useCreateSubSubCategoryMutation,
  useUpdateSubSubCategoryMutation,
  useGetLastSubSubCategoryCodeQuery,
  // Inventory Items
  useGetInventoryItemsQuery,
  useGetInventoryItemQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useGetLastItemCodeQuery,
} = stockAssetsApi;

