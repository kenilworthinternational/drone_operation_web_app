import { baseApi } from '../baseApi';

export const estatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all groups
    getGroups: builder.query({
      query: () => ({
        url: 'display_groups',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Groups'],
    }),

    // Get plantations by group
    getPlantationsByGroup: builder.query({
      query: (groupId) => ({
        url: 'display_plantation',
        method: 'POST',
        body: { group: groupId },
      }),
      providesTags: (result, error, groupId) => [{ type: 'Plantations', id: groupId }],
    }),

    // Get regions by plantation
    getRegionsByPlantation: builder.query({
      query: (plantationId) => ({
        url: 'display_region',
        method: 'POST',
        body: { plantation: plantationId },
      }),
      providesTags: (result, error, plantationId) => [{ type: 'Regions', id: plantationId }],
    }),

    // Get estates by region
    getEstatesByRegion: builder.query({
      query: (regionId) => ({
        url: 'display_estate',
        method: 'POST',
        body: { region: regionId },
      }),
      providesTags: (result, error, regionId) => [{ type: 'Estates', id: regionId }],
    }),

    // Get all plantations
    getAllPlantations: builder.query({
      query: () => ({
        url: 'display_all_plantation',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Plantations'],
    }),

    // Get all estates
    getAllEstates: builder.query({
      query: () => ({
        url: 'display_all_estates',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Estates'],
    }),

    // Get estates by plantation
    getEstatesByPlantation: builder.query({
      query: (plantationId) => ({
        url: 'display_estate_by_plantation',
        method: 'POST',
        body: { plantation: plantationId },
      }),
      providesTags: (result, error, plantationId) => [{ type: 'Estates', id: `plantation-${plantationId}` }],
    }),

    // Get estate details
    getEstateDetails: builder.query({
      query: (estateId) => ({
        url: 'estate_profile',
        method: 'POST',
        body: { estate: estateId },
      }),
      providesTags: (result, error, estateId) => [{ type: 'Estates', id: estateId }],
    }),

    // Get divisions by estate
    getDivisionsByEstate: builder.query({
      query: (estateId) => ({
        url: 'display_division_field_by_estate',
        method: 'POST',
        body: { estate: estateId },
      }),
      providesTags: (result, error, estateId) => [{ type: 'Divisions', id: estateId }],
    }),

    // Get field details
    getFieldDetails: builder.query({
      query: (fieldId) => ({
        url: 'details_by_field',
        method: 'POST',
        body: { field: fieldId },
      }),
      providesTags: (result, error, fieldId) => [{ type: 'Fields', id: fieldId }],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetPlantationsByGroupQuery,
  useGetRegionsByPlantationQuery,
  useGetEstatesByRegionQuery,
  useGetAllPlantationsQuery,
  useGetAllEstatesQuery,
  useGetEstatesByPlantationQuery,
  useGetEstateDetailsQuery,
  useGetDivisionsByEstateQuery,
  useGetFieldDetailsQuery,
} = estatesApi;

