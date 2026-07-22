import React, { useEffect, useMemo, useState } from 'react';
import { useGetSmartKpiReviewListQuery } from '../../../api/services NodeJs/employeeKpiApi';
import SmartKpiSetupBar, { defaultPeriodKey } from './SmartKpiSetupBar';
import SmartKpiTemplateScopePanel from './SmartKpiTemplateScopePanel';
import SmartKpiReviewList from './SmartKpiReviewList';
import SmartKpiSheet from './SmartKpiSheet';

const FILTERS_STORAGE_KEY = 'smartKpiTab.filters.v1';
const PERIOD_TYPES = new Set(['month', 'quarter', 'year']);

function loadInitialFilters() {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const periodType = PERIOD_TYPES.has(parsed?.periodType) ? parsed.periodType : 'quarter';
      return {
        periodType,
        periodKey: parsed?.periodKey || defaultPeriodKey(periodType),
        empDepartmentId: parsed?.empDepartmentId || '',
        empSubDivisionId: parsed?.empSubDivisionId || '',
        empJobRoleId: parsed?.empJobRoleId || '',
        search: parsed?.search || '',
      };
    }
  } catch {
    // Ignore broken localStorage payloads and fallback to defaults.
  }
  return {
    periodType: 'quarter',
    periodKey: defaultPeriodKey('quarter'),
    empDepartmentId: '',
    empSubDivisionId: '',
    empJobRoleId: '',
    search: '',
  };
}

export default function SmartKpiTab() {
  const [filters, setFilters] = useState(loadInitialFilters);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // Ignore storage failures.
    }
  }, [filters]);

  const queryBody = useMemo(
    () => ({
      periodType: filters.periodType,
      periodKey: filters.periodKey,
      empDepartmentId: filters.empDepartmentId ? Number(filters.empDepartmentId) : undefined,
      empJobRoleId: filters.empJobRoleId ? Number(filters.empJobRoleId) : undefined,
      search: filters.search?.trim() || undefined,
    }),
    [filters],
  );

  const { data: rows = [], isLoading, isFetching, refetch } = useGetSmartKpiReviewListQuery(queryBody);

  return (
    <div className="smart-kpi-tab">
      <SmartKpiSetupBar
        filters={filters}
        onChange={setFilters}
      />
      <SmartKpiTemplateScopePanel filters={filters} />
      <div className="smart-kpi-reviews-section">
        <h3 className="smart-kpi-reviews-heading">Employee SMART KPI reviews</h3>
        <SmartKpiReviewList
          rows={rows}
          isLoading={isLoading && !rows.length}
          isRefreshing={isFetching && rows.length > 0}
          onOpen={setSelectedReviewId}
        />
      </div>
      {selectedReviewId ? (
        <SmartKpiSheet
          reviewId={selectedReviewId}
          onClose={() => setSelectedReviewId(null)}
          onUpdated={() => refetch()}
        />
      ) : null}
    </div>
  );
}
