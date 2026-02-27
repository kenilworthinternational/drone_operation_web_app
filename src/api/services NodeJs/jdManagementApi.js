import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery, getNodeBackendUrl, getToken } from './nodeBackendConfig';

export const jdManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // USER LEVELS
    // =====================================================
    getUserLevels: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-levels',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['UserLevels'],
    }),

    // =====================================================
    // USER MEMBER TYPES
    // =====================================================
    getUserMemberTypes: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-member-types',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['UserMemberTypes'],
    }),

    // =====================================================
    // WINGS
    // =====================================================
    getWings: builder.query({
      queryFn: async () => {
        try {
          const result = await nodeBackendBaseQuery(
            {
              url: '/api/wings',
              method: 'POST',
              body: {},
            },
            {},
            {}
          );
          
          // Handle response - backend can return:
          // New format: { status: true, data: [...] }
          // Legacy format: { status: 'true', count: 7, wings: [...] }
          if (result.error) {
            return { error: result.error };
          }
          
          // Return the response as-is, let the component handle the structure
          // Component will check for result.data, result.data.data, or result.wings
          return { data: result.data || result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['Wings'],
    }),

    // =====================================================
    // DRIVING LICENSE TYPES
    // =====================================================
    getDrivingLicenseTypes: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/driving-license-types',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['DrivingLicenseTypes'],
    }),

    // =====================================================
    // WORK LOCATIONS
    // =====================================================
    getWorkLocations: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/work-locations',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        
        // Handle response - backend returns { status: true, data: workLocations }
        if (result.error) {
          return result;
        }
        
        // Transform response to match expected structure
        if (result.data && result.data.data) {
          return { data: result.data.data };
        }
        
        return result;
      },
      providesTags: ['WorkLocations'],
    }),

    // =====================================================
    // DSCS (DIVISIONAL SECRETARIATS)
    // =====================================================
    getDSCS: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/dscs',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        
        // Handle response - backend returns { status: true, data: dscs }
        if (result.error) {
          return result;
        }
        
        // Transform response to match expected structure
        if (result.data && result.data.data) {
          return { data: result.data.data };
        }
        
        return result;
      },
      providesTags: ['DSCS'],
    }),

    // =====================================================
    // PROVINCES
    // =====================================================
    getProvinces: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/provinces',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        
        if (result.error) {
          return result;
        }
        
        if (result.data && result.data.data) {
          return { data: result.data.data };
        }
        
        return result;
      },
      providesTags: ['Provinces'],
    }),

    // =====================================================
    // DISTRICTS
    // =====================================================
    getDistricts: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/districts',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        
        if (result.error) {
          return result;
        }
        
        if (result.data && result.data.data) {
          return { data: result.data.data };
        }
        
        return result;
      },
      providesTags: ['Districts'],
    }),

    // =====================================================
    // GROUPS
    // =====================================================
    getGroups: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/groups',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        
        if (result.error) {
          return result;
        }
        
        // Handle response: { status: true, data: [...] }
        if (result.data && result.data.status && result.data.data) {
          return { data: result.data.data };
        }
        
        // Handle direct array response
        if (Array.isArray(result.data)) {
          return { data: result.data };
        }
        
        return result;
      },
      providesTags: ['Groups'],
    }),

    // =====================================================
    // PLANTATIONS
    // =====================================================
    getPlantations: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/plantations',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        
        if (result.error) {
          return result;
        }
        
        // Handle response: { status: true, data: [...] }
        if (result.data && result.data.status && result.data.data) {
          return { data: result.data.data };
        }
        
        // Handle direct array response
        if (Array.isArray(result.data)) {
          return { data: result.data };
        }
        
        return result;
      },
      providesTags: ['Plantations'],
    }),

    // =====================================================
    // REGIONS
    // =====================================================
    getRegions: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/regions',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        
        if (result.error) {
          return result;
        }
        
        // Handle response: { status: true, data: [...] }
        if (result.data && result.data.status && result.data.data) {
          return { data: result.data.data };
        }
        
        // Handle direct array response
        if (Array.isArray(result.data)) {
          return { data: result.data };
        }
        
        return result;
      },
      providesTags: ['Regions'],
    }),

    // =====================================================
    // ESTATES
    // =====================================================
    getEstates: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/estates',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        
        if (result.error) {
          return result;
        }
        
        // Handle response: { status: true, data: [...] }
        if (result.data && result.data.status && result.data.data) {
          return { data: result.data.data };
        }
        
        // Handle direct array response
        if (Array.isArray(result.data)) {
          return { data: result.data };
        }
        
        return result;
      },
      providesTags: ['Estates'],
    }),

    // =====================================================
    // ASCS (AGRARIAN SERVICE CENTERS)
    // =====================================================
    getASCS: builder.query({
      queryFn: async (arg) => {
        const filters = arg || {};
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/ascs',
            method: 'POST',
            body: filters,
          },
          {},
          {}
        );
        
        if (result.error) {
          return result;
        }
        
        if (result.data && result.data.data) {
          return { data: result.data.data };
        }
        
        return result;
      },
      providesTags: ['ASCS'],
    }),

    // =====================================================
    // USER JOB ROLES
    // =====================================================
    getUserJobRoles: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-roles',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['UserJobRoles'],
    }),

    getUserJobRoleById: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-roles/view',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'UserJobRoles', id }],
    }),

    createUserJobRole: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-roles/create',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['UserJobRoles'],
    }),

    updateUserJobRole: builder.mutation({
      queryFn: async ({ id, ...data }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-roles/update',
            method: 'POST',
            body: { id, ...data },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'UserJobRoles', id }, 'UserJobRoles'],
    }),

    deleteUserJobRole: builder.mutation({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-roles/delete',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['UserJobRoles'],
    }),

    // =====================================================
    // USER JOB DESCRIPTIONS
    // =====================================================
    getUserJobDescriptions: builder.query({
      queryFn: async (jobRoleId) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-descriptions',
            method: 'POST',
            body: jobRoleId ? { jobRoleId } : {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['UserJobDescriptions'],
    }),

    getUserJobDescriptionById: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-descriptions/view',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'UserJobDescriptions', id }],
    }),

    createUserJobDescription: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-descriptions/create',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['UserJobDescriptions'],
    }),

    createMultipleUserJobDescriptions: builder.mutation({
      queryFn: async (data) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-descriptions/bulk',
            method: 'POST',
            body: data,
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['UserJobDescriptions'],
    }),

    updateUserJobDescription: builder.mutation({
      queryFn: async ({ id, ...data }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-descriptions/update',
            method: 'POST',
            body: { id, ...data },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'UserJobDescriptions', id }, 'UserJobDescriptions'],
    }),

    deleteUserJobDescription: builder.mutation({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-descriptions/delete',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['UserJobDescriptions'],
    }),

    // =====================================================
    // GET JOB ROLE WITH DESCRIPTIONS
    // =====================================================
    getUserJobRoleWithDescriptions: builder.query({
      queryFn: async (id) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-roles/descriptions',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: (result, error, id) => [{ type: 'UserJobRoles', id }, 'UserJobDescriptions'],
    }),

    // =====================================================
    // FIND DESCRIPTIONS BY TASK TEXT (for shared tasks)
    // =====================================================
    findDescriptionsByTaskText: builder.query({
      queryFn: async (taskDescription) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-descriptions/search/by-text',
            method: 'POST',
            body: { taskDescription },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['UserJobDescriptions'],
    }),

    // =====================================================
    // GET SHARED DESIGNATIONS FOR TASK
    // =====================================================
    getSharedDesignationsForTask: builder.query({
      queryFn: async (taskId) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-descriptions/shared-designations',
            method: 'POST',
            body: { taskId },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['UserJobDescriptions'],
    }),

    // =====================================================
    // UPDATE TASK ORDERS (for drag and drop)
    // =====================================================
    updateTaskOrders: builder.mutation({
      queryFn: async ({ jobRoleId, taskOrders }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/user-job-descriptions/update-orders',
            method: 'POST',
            body: { jobRoleId, taskOrders },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['UserJobDescriptions'],
    }),

    // =====================================================
    // EMPLOYEE REGISTRATION
    // =====================================================
    createEmployeeRegistration: builder.mutation({
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
        const response = await fetch(`${baseUrl}/api/employee-registration/create`, {
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
      invalidatesTags: ['EmployeeRegistrations'],
    }),

    updateEmployeeRegistration: builder.mutation({
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
        const response = await fetch(`${baseUrl}/api/employee-registration/update`, {
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
      invalidatesTags: ['EmployeeRegistrations'],
    }),

    forwardToPayroll: builder.mutation({
      queryFn: async ({ id }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/employee-registration/forward-to-payroll',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['EmployeeRegistrations'],
    }),

    getAllEmployeeRegistrations: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/employee-registration/list',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['EmployeeRegistrations'],
    }),

    getEmployeeRegistrationById: builder.query({
      queryFn: async ({ id }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/employee-registration/view',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['EmployeeRegistrations'],
    }),

    getLastEmpNo: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/employee-registration/last-emp-no',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['EmployeeRegistrations'],
    }),

    // =====================================================
    // USER MANAGEMENT
    // =====================================================
    searchEmployee: builder.query({
      queryFn: async ({ searchTerm }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/users/search-employee',
            method: 'POST',
            body: { searchTerm },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Employees'],
    }),

    createUser: builder.mutation({
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
        const response = await fetch(`${baseUrl}/api/users/create`, {
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
      invalidatesTags: ['Users'],
    }),

    getAllUsers: builder.query({
      queryFn: async () => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/users/list',
            method: 'POST',
            body: {},
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Users'],
    }),

    getUserById: builder.query({
      queryFn: async ({ id }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/users/view',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      providesTags: ['Users'],
    }),

    updateUser: builder.mutation({
      queryFn: async (args) => {
        // Handle both FormData and regular object
        const isFormData = args instanceof FormData;
        let id, data;
        
        if (isFormData) {
          // If FormData, id should already be appended
          data = args;
        } else {
          // Regular object destructuring
          ({ id, ...data } = args);
        }
        
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
        let body;
        
        if (isFormData) {
          // If FormData, ensure id is appended
          if (!data.has('id')) {
            data.append('id', id);
          }
          body = data;
        } else {
          body = JSON.stringify({ id, ...data });
        }
        
        const response = await fetch(`${baseUrl}/api/users/update`, {
          method: 'POST',
          headers,
          body,
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          return { error: { status: response.status, data: result } };
        }
        
        return { data: result };
      },
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation({
      queryFn: async ({ id }) => {
        const result = await nodeBackendBaseQuery(
          {
            url: '/api/users/delete',
            method: 'POST',
            body: { id },
          },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetUserLevelsQuery,
  useGetUserMemberTypesQuery,
  useGetWingsQuery,
  useGetDrivingLicenseTypesQuery,
  useGetWorkLocationsQuery,
  useGetDSCSQuery,
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetASCSQuery,
  useGetGroupsQuery,
  useGetPlantationsQuery,
  useGetRegionsQuery,
  useGetEstatesQuery,
  useGetUserJobRolesQuery,
  useGetUserJobRoleByIdQuery,
  useCreateUserJobRoleMutation,
  useUpdateUserJobRoleMutation,
  useDeleteUserJobRoleMutation,
  useGetUserJobDescriptionsQuery,
  useGetUserJobDescriptionByIdQuery,
  useCreateUserJobDescriptionMutation,
  useCreateMultipleUserJobDescriptionsMutation,
  useUpdateUserJobDescriptionMutation,
  useDeleteUserJobDescriptionMutation,
  useGetUserJobRoleWithDescriptionsQuery,
  useFindDescriptionsByTaskTextQuery,
  useGetSharedDesignationsForTaskQuery,
  useUpdateTaskOrdersMutation,
  useCreateEmployeeRegistrationMutation,
  useUpdateEmployeeRegistrationMutation,
  useForwardToPayrollMutation,
  useGetAllEmployeeRegistrationsQuery,
  useGetEmployeeRegistrationByIdQuery,
  useGetLastEmpNoQuery,
  useSearchEmployeeQuery,
  useCreateUserMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = jdManagementApi;

