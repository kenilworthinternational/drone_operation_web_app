import { baseApi } from '../baseApi';

export const farmersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get farmer details by NIC
    getFarmerByNIC: builder.query({
      query: (nic) => ({
        url: 'farmer_by_nic',
        method: 'POST',
        body: { nic },
      }),
      providesTags: (result, error, nic) => [{ type: 'Farmers', id: nic }],
    }),

    // Add farmer
    addFarmer: builder.mutation({
      query: (farmerData) => ({
        url: 'add_farmer',
        method: 'POST',
        body: farmerData,
      }),
      invalidatesTags: ['Farmers'],
    }),

    // Update farmer
    updateFarmer: builder.mutation({
      query: (farmerData) => ({
        url: 'update_farmer',
        method: 'POST',
        body: farmerData,
      }),
      invalidatesTags: (result, error, data) => [
        { type: 'Farmers', id: data.nic },
        'Farmers'
      ],
    }),
  }),
});

export const {
  useGetFarmerByNICQuery,
  useLazyGetFarmerByNICQuery,
  useAddFarmerMutation,
  useUpdateFarmerMutation,
} = farmersApi;

