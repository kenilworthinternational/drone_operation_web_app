import { useCallback, useMemo } from 'react';
import { useGetHrMasterOptionsGroupedQuery } from '../../../api/services NodeJs/hrMasterOptionsApi';

export function useHrMasterOptions() {
  const { data, isLoading, isFetching } = useGetHrMasterOptionsGroupedQuery();

  const grouped = data || {};

  const getOptions = useCallback(
    (category) => {
      const rows = grouped[category] || [];
      return rows.map((row) => ({
        value: row.option_value,
        label: row.label,
      }));
    },
    [grouped],
  );

  const getLabels = useCallback(
    (category) => (grouped[category] || []).map((row) => row.option_value),
    [grouped],
  );

  return useMemo(
    () => ({
      grouped,
      getOptions,
      getLabels,
      isLoading: isLoading || isFetching,
    }),
    [grouped, getOptions, getLabels, isLoading, isFetching],
  );
}
