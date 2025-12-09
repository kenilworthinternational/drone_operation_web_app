import { baseApi } from '../baseApi';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Node.js Backend Base URL Configuration
const getNodeBackendUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'https://dsms-web-api-dev.kenilworthinternational.com';
  }
  
  if (hostname.includes('dev') || hostname.includes('kenilworthinternational.com')) {
    return 'https://dsms-web-api-dev.kenilworthinternational.com';
  }
  
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
  prepareHeaders: (headers, { endpoint }) => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    // For file upload, don't set Content-Type (let browser set it with boundary)
    if (endpoint !== 'uploadDjiImage') {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

export const djiImagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload DJI image
    uploadDjiImage: builder.mutation({
      queryFn: async (formData, api, extraOptions, baseQuery) => {
        const token = getToken();
        const response = await fetch(`${getNodeBackendUrl()}/api/dji-images/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { error: data.error || 'Upload failed' };
        }
        
        return { data };
      },
      invalidatesTags: ['DjiImages'],
    }),

    // Get unlinked DJI images for a date
    getUnlinkedDjiImages: builder.query({
      queryFn: async (date, api, extraOptions, baseQuery) => {
        return nodeBackendBaseQuery(
          { url: `/api/dji-images/unlinked/${date}`, method: 'GET' },
          api,
          extraOptions
        );
      },
      providesTags: ['DjiImages'],
    }),

    // Get all DJI images with filters
    getAllDjiImages: builder.query({
      queryFn: async (filters = {}, api, extraOptions, baseQuery) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== null) {
            params.append(key, filters[key]);
          }
        });
        const queryString = params.toString();
        const url = `/api/dji-images${queryString ? `?${queryString}` : ''}`;
        return nodeBackendBaseQuery(
          { url, method: 'GET' },
          api,
          extraOptions
        );
      },
      providesTags: ['DjiImages'],
    }),

    // Get DJI image by ID
    getDjiImageById: builder.query({
      queryFn: async (id, api, extraOptions, baseQuery) => {
        return nodeBackendBaseQuery(
          { url: `/api/dji-images/${id}`, method: 'GET' },
          api,
          extraOptions
        );
      },
      providesTags: (result, error, id) => [{ type: 'DjiImages', id }],
    }),

    // Update DJI image
    updateDjiImage: builder.mutation({
      queryFn: async ({ id, ...data }, api, extraOptions, baseQuery) => {
        return nodeBackendBaseQuery(
          {
            url: `/api/dji-images/${id}`,
            method: 'PUT',
            body: data,
          },
          api,
          extraOptions
        );
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'DjiImages', id }, 'DjiImages'],
    }),

    // Link DJI image to task
    linkDjiImageToTask: builder.mutation({
      queryFn: async ({ imageId, taskId }, api, extraOptions, baseQuery) => {
        return nodeBackendBaseQuery(
          {
            url: '/api/dji-images/link',
            method: 'POST',
            body: { imageId, taskId },
          },
          api,
          extraOptions
        );
      },
      invalidatesTags: ['DjiImages'],
    }),

    // Delete DJI image
    deleteDjiImage: builder.mutation({
      queryFn: async (id, api, extraOptions, baseQuery) => {
        return nodeBackendBaseQuery(
          { url: `/api/dji-images/${id}`, method: 'DELETE' },
          api,
          extraOptions
        );
      },
      invalidatesTags: ['DjiImages'],
    }),

    // Get count of DJI images uploaded today
    getTodayDjiImagesCount: builder.query({
      queryFn: async () => {
        return nodeBackendBaseQuery(
          { url: '/api/dji-images/today-count', method: 'POST', body: {} },
          {},
          {}
        );
      },
      providesTags: ['DjiImagesCount'],
    }),
  }),
});

export const {
  useUploadDjiImageMutation,
  useGetUnlinkedDjiImagesQuery,
  useGetAllDjiImagesQuery,
  useGetDjiImageByIdQuery,
  useUpdateDjiImageMutation,
  useLinkDjiImageToTaskMutation,
  useDeleteDjiImageMutation,
  useGetTodayDjiImagesCountQuery,
} = djiImagesApi;

