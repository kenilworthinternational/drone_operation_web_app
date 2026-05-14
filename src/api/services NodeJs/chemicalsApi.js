import { baseApi } from '../baseApi';
import { nodeBackendBaseQuery } from './nodeBackendConfig';

const CHEMICALS_LIST_ARG = { include_inactive: true };

function patchChemicalsCache(dispatch, recipe) {
  dispatch(
    baseApi.util.updateQueryData('getChemicals', CHEMICALS_LIST_ARG, (draft) => {
      if (!Array.isArray(draft)) return;
      recipe(draft);
    })
  );
}

export const chemicalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChemicals: builder.query({
      queryFn: async ({ include_inactive = true } = {}) => {
        const q = include_inactive ? '?include_inactive=1' : '';
        const result = await nodeBackendBaseQuery(
          { url: `/api/chemicals${q}`, method: 'GET' },
          {},
          {}
        );
        if (result.error) return result;
        return { data: result.data?.data || [] };
      },
      providesTags: ['Chemicals'],
    }),

    createChemical: builder.mutation({
      queryFn: async (body) => {
        const result = await nodeBackendBaseQuery(
          { url: '/api/chemicals', method: 'POST', body },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Chemicals'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const queryFnReturn = res?.data;
          const httpJson = queryFnReturn?.data;
          const newId = httpJson?.data?.id ?? httpJson?.id;
          if (newId == null) return;
          patchChemicalsCache(dispatch, (draft) => {
            const sid = String(newId);
            if (draft.some((r) => String(r.id) === sid)) return;
            const priority =
              arg.priority != null && Number.isFinite(Number(arg.priority))
                ? Number(arg.priority)
                : 50;
            const activated = arg.activated != null && Number(arg.activated) === 0 ? 0 : 1;
            draft.push({
              id: newId,
              chemical: arg.chemical,
              category: arg.category ?? null,
              priority,
              activated,
            });
          });
        } catch {
          /* mutation failed */
        }
      },
    }),

    updateChemical: builder.mutation({
      queryFn: async ({ id, ...body }) => {
        const result = await nodeBackendBaseQuery(
          { url: `/api/chemicals/${id}`, method: 'PUT', body },
          {},
          {}
        );
        return result;
      },
      invalidatesTags: ['Chemicals'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { id, ...rest } = arg;
        try {
          await queryFulfilled;
          patchChemicalsCache(dispatch, (draft) => {
            const row = draft.find((r) => String(r.id) === String(id));
            if (!row) return;
            if (rest.chemical != null) row.chemical = rest.chemical;
            if (rest.category !== undefined) row.category = rest.category;
            if (rest.priority != null) row.priority = Number(rest.priority) || row.priority;
            if (rest.activated != null) row.activated = Number(rest.activated) === 0 ? 0 : 1;
          });
        } catch {
          /* mutation failed */
        }
      },
    }),
  }),
});

export const {
  useGetChemicalsQuery,
  useCreateChemicalMutation,
  useUpdateChemicalMutation,
} = chemicalsApi;
