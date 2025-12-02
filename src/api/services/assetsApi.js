import { baseApi } from '../baseApi';

export const assetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Drones
    getDrones: builder.query({
      query: () => ({
        url: 'view_drone',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Assets', 'Drones'],
    }),

    createDrone: builder.mutation({
      query: (data) => ({
        url: 'create_drone',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Drones'],
    }),

    updateDrone: builder.mutation({
      query: (data) => ({
        url: 'update_drone',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Drones'],
    }),

    // Generators
    getGenerators: builder.query({
      query: () => ({
        url: 'view_generator',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Assets', 'Generators'],
    }),

    createGenerator: builder.mutation({
      query: (data) => ({
        url: 'create_generator',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Generators'],
    }),

    updateGenerator: builder.mutation({
      query: (data) => ({
        url: 'update_generator',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Generators'],
    }),

    // Vehicles
    getVehicles: builder.query({
      query: () => ({
        url: 'view_vehicle',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Assets', 'Vehicles'],
    }),

    createVehicle: builder.mutation({
      query: (data) => ({
        url: 'create_vehicle',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Vehicles'],
    }),

    updateVehicle: builder.mutation({
      query: (data) => ({
        url: 'update_vehicle',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Vehicles'],
    }),

    // Remote Controls
    getRemoteControls: builder.query({
      query: () => ({
        url: 'view_remote_control',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Assets', 'RemoteControls'],
    }),

    createRemoteControl: builder.mutation({
      query: (data) => ({
        url: 'create_remote_control',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'RemoteControls'],
    }),

    updateRemoteControl: builder.mutation({
      query: (data) => ({
        url: 'update_remote_control',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'RemoteControls'],
    }),

    // Batteries
    getBatteries: builder.query({
      query: () => ({
        url: 'view_battery',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Assets', 'Batteries'],
    }),

    createBattery: builder.mutation({
      query: (data) => ({
        url: 'create_battery',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Batteries'],
    }),

    updateBattery: builder.mutation({
      query: (data) => ({
        url: 'update_battery',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Batteries'],
    }),

    // Insurance Types
    getInsuranceTypes: builder.query({
      query: () => ({
        url: 'view_insurance_type',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Insurance'],
    }),

    // Battery Types
    getBatteryTypes: builder.query({
      query: () => ({
        url: 'view_battery_type',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Batteries'],
    }),

    // Wings
    getWings: builder.query({
      query: () => ({
        url: 'view_wing',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Wings'],
    }),

    // Sector Updates
    updateAssetsSectorDrone: builder.mutation({
      query: (data) => ({
        url: 'update_assets_sector_drone',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Drones'],
    }),

    updateAssetsSectorVehicle: builder.mutation({
      query: (data) => ({
        url: 'update_assets_sector_vehicle',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Vehicles'],
    }),

    updateAssetsSectorGenerator: builder.mutation({
      query: (data) => ({
        url: 'update_assets_sector_generator',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Generators'],
    }),

    updateAssetsSectorRemoteControl: builder.mutation({
      query: (data) => ({
        url: 'update_assets_sector_remote_control',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'RemoteControls'],
    }),

    updateAssetsSectorBattery: builder.mutation({
      query: (data) => ({
        url: 'update_assets_sector_battery',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets', 'Batteries'],
    }),
  }),
});

export const {
  useGetDronesQuery,
  useCreateDroneMutation,
  useUpdateDroneMutation,
  useGetGeneratorsQuery,
  useCreateGeneratorMutation,
  useUpdateGeneratorMutation,
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useGetRemoteControlsQuery,
  useCreateRemoteControlMutation,
  useUpdateRemoteControlMutation,
  useGetBatteriesQuery,
  useCreateBatteryMutation,
  useUpdateBatteryMutation,
  useGetInsuranceTypesQuery,
  useGetBatteryTypesQuery,
  useGetWingsQuery,
  useUpdateAssetsSectorDroneMutation,
  useUpdateAssetsSectorVehicleMutation,
  useUpdateAssetsSectorGeneratorMutation,
  useUpdateAssetsSectorRemoteControlMutation,
  useUpdateAssetsSectorBatteryMutation,
} = assetsApi;

