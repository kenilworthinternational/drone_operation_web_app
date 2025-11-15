import { baseApi } from '../baseApi';

export const dropdownsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get sectors
    getSectors: builder.query({
      query: () => ({
        url: 'display_sectors',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Sectors'],
    }),

    // Get mission types
    getMissionTypes: builder.query({
      query: () => ({
        url: 'mission_type',
        method: 'POST',
        body: {},
      }),
      providesTags: ['MissionTypes'],
    }),

    // Get crop types
    getCropTypes: builder.query({
      query: () => ({
        url: 'display_crop_type',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Crops'],
    }),

    // Get time slots
    getTimeSlots: builder.query({
      query: () => ({
        url: 'time_of_the_day',
        method: 'POST',
        body: {},
      }),
      providesTags: ['TimeSlots'],
    }),

    // Get chemical types
    getChemicalTypes: builder.query({
      query: () => ({
        url: 'chemical_type',
        method: 'POST',
        body: {},
      }),
      providesTags: ['ChemicalTypes'],
    }),

    // Get stages/growth levels
    getStages: builder.query({
      query: () => ({
        url: 'display_growth_level',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Stages'],
    }),

    // Get ASCs
    getASCs: builder.query({
      query: () => ({
        url: 'display_asc',
        method: 'POST',
        body: {},
      }),
      providesTags: ['ASC'],
    }),

    // Get reject reasons
    getRejectReasons: builder.query({
      query: () => ({
        url: 'display_reject_reasons',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Reasons'],
    }),

    // Get flag reasons
    getFlagReasons: builder.query({
      query: () => ({
        url: 'flag_reasons',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Reasons'],
    }),

    // Get partial complete reasons (downtime reasons)
    getPartialCompleteReasons: builder.query({
      query: (flag = 'c') => ({
        url: 'display_partial_complete_reasons',
        method: 'POST',
        body: { flag },
      }),
      providesTags: ['Reasons'],
    }),
  }),
});

export const {
  useGetSectorsQuery,
  useGetMissionTypesQuery,
  useGetCropTypesQuery,
  useGetTimeSlotsQuery,
  useGetChemicalTypesQuery,
  useGetStagesQuery,
  useGetASCsQuery,
  useGetRejectReasonsQuery,
  useGetFlagReasonsQuery,
  useGetPartialCompleteReasonsQuery,
} = dropdownsApi;

