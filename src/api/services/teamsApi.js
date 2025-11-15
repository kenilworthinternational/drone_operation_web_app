import { baseApi } from '../baseApi';

export const teamsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get pilots and drones details
    getPilotsAndDrones: builder.query({
      query: () => ({
        url: 'team_lead_and_pilot_list',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Pilots', 'Drones'],
    }),

    // Get ASC pilots and drones
    getASCPilotsAndDrones: builder.query({
      query: () => ({
        url: 'asc_team_lead_and_pilot_list',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Pilots', 'Drones'],
    }),

    // Get drones list
    getDronesList: builder.query({
      query: () => ({
        url: 'drone_list',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Drones'],
    }),

    // Get pilots and drones in teams
    getPilotsAndDronesInTeams: builder.query({
      query: () => ({
        url: 'display_pilots_and_drons_in_teams',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Teams'],
    }),

    // Display all team data
    getTeamData: builder.query({
      query: () => ({
        url: 'display_all_team_pilot_drone',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Teams'],
    }),

    // Display non-plantation team data
    getTeamDataNonPlantation: builder.query({
      query: () => ({
        url: 'display_all_non_plantaion_team_pilot_drone',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Teams'],
    }),

    // Get pilots and drones without team
    getPilotsAndDronesWithoutTeam: builder.query({
      query: () => ({
        url: 'pilots_and_drones_without_team',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Pilots', 'Drones'],
    }),

    // Get non-plantation pilots and drones without team
    getNonPlantationPilotsWithoutTeam: builder.query({
      query: () => ({
        url: 'non_plantaion_pilots_and_drones_without_team',
        method: 'POST',
        body: {},
      }),
      providesTags: ['Pilots', 'Drones'],
    }),

    // Get pilot details for plan
    getPilotDetailsForPlan: builder.query({
      query: (planId) => ({
        url: 'plan_team_drone_by_plan_id',
        method: 'POST',
        body: { plan_id: planId },
      }),
      providesTags: (result, error, planId) => [{ type: 'PlanDetails', id: `pilot-${planId}` }],
    }),

    // Add team to plan
    addTeamToPlan: builder.mutation({
      query: (data) => ({
        url: 'add_team_to_plan',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, data) => [
        { type: 'PlanDetails', id: data.plan },
        'Plans'
      ],
    }),

    // Add team to mission (non-plantation)
    addTeamToMission: builder.mutation({
      query: ({ planId, teamId }) => ({
        url: 'add_team_to_mission',
        method: 'POST',
        body: { plan_id: planId, team_id: teamId },
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: 'MissionDetails', id: planId },
        'Missions'
      ],
    }),

    // Add drone or pilot to pool
    addDroneOrPilotToPool: builder.mutation({
      query: (data) => ({
        url: 'add_team_pilot_drone',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Teams', 'Pilots', 'Drones'],
    }),

    // Add drone or pilot to pool (non-plantation)
    addDroneOrPilotToPoolNonPlantation: builder.mutation({
      query: (data) => ({
        url: 'add_non_plantaion_team_pilot_drone',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Teams', 'Pilots', 'Drones'],
    }),

    // Update team pilot
    updateTeamPilot: builder.mutation({
      query: (data) => ({
        url: 'update_team_pilot',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Teams', 'Pilots'],
    }),

    // Update team pilot (non-plantation)
    updateTeamPilotNonPlantation: builder.mutation({
      query: (data) => ({
        url: 'update_non_plantaion_team_pilot',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Teams', 'Pilots'],
    }),

    // Update team drone
    updateTeamDrone: builder.mutation({
      query: (data) => ({
        url: 'update_team_drone',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Teams', 'Drones'],
    }),

    // Update team drone (non-plantation)
    updateTeamDroneNonPlantation: builder.mutation({
      query: (data) => ({
        url: 'update_non_plantaion_team_drone',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Teams', 'Drones'],
    }),

    // Get team planned data by date
    getTeamPlannedData: builder.query({
      query: (data) => ({
        url: 'plan_team_drone_by_date',
        method: 'POST',
        body: data,
      }),
      providesTags: ['Teams'],
    }),

    // Get team planned data (non-plantation)
    getTeamPlannedDataNonPlantation: builder.query({
      query: (data) => ({
        url: 'plan_non_plantaion_team_drone_by_date',
        method: 'POST',
        body: data,
      }),
      providesTags: ['Teams'],
    }),
  }),
});

export const {
  useGetPilotsAndDronesQuery,
  useGetASCPilotsAndDronesQuery,
  useGetDronesListQuery,
  useGetPilotsAndDronesInTeamsQuery,
  useGetTeamDataQuery,
  useGetTeamDataNonPlantationQuery,
  useGetPilotsAndDronesWithoutTeamQuery,
  useGetNonPlantationPilotsWithoutTeamQuery,
  useGetPilotDetailsForPlanQuery,
  useAddTeamToPlanMutation,
  useAddTeamToMissionMutation,
  useAddDroneOrPilotToPoolMutation,
  useAddDroneOrPilotToPoolNonPlantationMutation,
  useUpdateTeamPilotMutation,
  useUpdateTeamPilotNonPlantationMutation,
  useUpdateTeamDroneMutation,
  useUpdateTeamDroneNonPlantationMutation,
  useGetTeamPlannedDataQuery,
  useGetTeamPlannedDataNonPlantationQuery,
} = teamsApi;

