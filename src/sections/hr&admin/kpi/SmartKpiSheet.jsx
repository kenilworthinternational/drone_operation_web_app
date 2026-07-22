import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useLazyGetSmartKpiReviewDetailQuery,
  useGetSmartKpiFieldTypesQuery,
  useSaveSmartKpiGoalsMutation,
  useSaveSmartKpiResultsMutation,
  useSmartKpiWorkflowMutation,
} from '../../../api/services NodeJs/employeeKpiApi';
import SmartKpiFieldRenderer from './SmartKpiFieldRenderer';
import { canLockGoals, canSubmitResults, collectGoalValidationErrors, collectResultValidationErrors } from './smartKpiGoalValidation';

const WORKFLOW_BUTTONS = [
  { action: 'lock_goals', label: 'Lock goals', statuses: ['draft', 'goals_set'] },
  { action: 'open_results', label: 'Open results', statuses: ['active', 'goals_set'] },
  { action: 'submit_results', label: 'Submit for review', statuses: ['results_pending', 'active'] },
  { action: 'close', label: 'Close review', statuses: ['under_review'] },
  { action: 'reopen', label: 'Reopen', statuses: ['closed'] },
];

function getNextWorkflowActions(reviewStatus, goalsLocked) {
  if (!goalsLocked) return ['lock_goals'];
  if (reviewStatus === 'goals_set') return ['open_results'];
  if (reviewStatus === 'active' || reviewStatus === 'results_pending') return ['submit_results'];
  if (reviewStatus === 'under_review') return ['close'];
  if (reviewStatus === 'closed') return ['reopen'];
  return [];
}

export default function SmartKpiSheet({ reviewId, onClose, onUpdated }) {
  const [fetchDetail, { data, isFetching }] = useLazyGetSmartKpiReviewDetailQuery();
  const { data: fieldTypes = [] } = useGetSmartKpiFieldTypesQuery();
  const [saveGoals, { isLoading: savingGoals }] = useSaveSmartKpiGoalsMutation();
  const [saveResults, { isLoading: savingResults }] = useSaveSmartKpiResultsMutation();
  const [workflow, { isLoading: workflowLoading }] = useSmartKpiWorkflowMutation();
  const [draftItems, setDraftItems] = useState([]);
  const [message, setMessage] = useState(null);

  const load = useCallback(() => {
    if (reviewId) fetchDetail({ reviewId });
  }, [reviewId, fetchDetail]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (data?.items) {
      setDraftItems(data.items.map((item) => ({
        id: item.id,
        description_text: item.description_text || '',
        goal_values: item.goal_values || {},
        result_values: item.result_values || {},
        goal_field_schema: item.goal_field_schema || [],
        result_field_schema: item.result_field_schema || [],
        dimension_code: item.dimension_code,
        dimension_name: item.dimension_name,
        dimension_letter: item.dimension_letter,
        title: item.title,
        guidance_text: item.guidance_text,
        item_score: item.item_score,
        status: item.status,
      })));
    }
  }, [data]);

  const review = data?.review;
  const goalsLocked = review?.goals_locked_at || ['active', 'results_pending', 'under_review', 'closed'].includes(review?.status);
  const canEditResults = goalsLocked && ['active', 'results_pending', 'under_review'].includes(review?.status);
  const nextWorkflowActions = getNextWorkflowActions(review?.status, goalsLocked);
  const goalValidationErrors = useMemo(
    () => collectGoalValidationErrors(draftItems, fieldTypes),
    [draftItems, fieldTypes],
  );
  const goalsReadyToLock = canLockGoals(draftItems, fieldTypes);
  const resultValidationErrors = useMemo(
    () => collectResultValidationErrors(draftItems, fieldTypes),
    [draftItems, fieldTypes],
  );
  const resultsReadyToSubmit = canSubmitResults(draftItems, fieldTypes);

  const updateItem = (index, patch) => {
    setDraftItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const saveGoalValues = async () => {
    if (!review?.id) return;
    setMessage(null);
    try {
      await saveGoals({
        reviewId: review.id,
        items: draftItems.map((item) => ({
          id: item.id,
          description_text: item.description_text,
          goal_values: item.goal_values,
        })),
      }).unwrap();
      setMessage({ type: 'success', text: 'Goals saved.' });
      load();
      onUpdated?.();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to save goals.' });
    }
  };

  const lockGoalsWithSave = async () => {
    if (!review?.id) return;
    setMessage(null);
    if (!goalsReadyToLock) {
      setMessage({
        type: 'error',
        text: goalValidationErrors.slice(0, 3).join(' ') || 'Complete all required goal fields before locking.',
      });
      return;
    }
    try {
      await saveGoals({
        reviewId: review.id,
        items: draftItems.map((item) => ({
          id: item.id,
          description_text: item.description_text,
          goal_values: item.goal_values,
        })),
      }).unwrap();
      await workflow({ reviewId: review.id, action: 'lock_goals' }).unwrap();
      setMessage({ type: 'success', text: 'Goals saved and locked.' });
      load();
      onUpdated?.();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to lock goals.' });
    }
  };

  const saveResultValues = async () => {
    if (!review?.id) return;
    setMessage(null);
    try {
      await saveResults({
        reviewId: review.id,
        items: draftItems.map((item) => ({
          id: item.id,
          result_values: item.result_values,
        })),
      }).unwrap();
      setMessage({ type: 'success', text: 'Results saved and scored. Submit for review when ready.' });
      load();
      onUpdated?.();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to save results.' });
    }
  };

  const submitResultsWithSave = async () => {
    if (!review?.id) return;
    setMessage(null);
    if (!resultsReadyToSubmit) {
      setMessage({
        type: 'error',
        text: resultValidationErrors.slice(0, 3).join(' ') || 'Complete all result fields before submitting.',
      });
      return;
    }
    try {
      await saveResults({
        reviewId: review.id,
        items: draftItems.map((item) => ({
          id: item.id,
          result_values: item.result_values,
        })),
      }).unwrap();
      await workflow({ reviewId: review.id, action: 'submit_results' }).unwrap();
      setMessage({ type: 'success', text: 'Results submitted for review.' });
      load();
      onUpdated?.();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to submit results.' });
    }
  };

  const runWorkflow = async (action) => {
    if (!review?.id) return;
    setMessage(null);
    try {
      await workflow({ reviewId: review.id, action }).unwrap();
      setMessage({ type: 'success', text: 'Review updated.' });
      load();
      onUpdated?.();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Workflow action failed.' });
    }
  };

  if (!reviewId) return null;

  const stepHint = !goalsLocked
    ? goalsReadyToLock
      ? 'Step 1: All required goals are filled. Save, then lock goals to continue.'
      : 'Step 1: Fill all required goal fields (description + required targets), save, then lock goals.'
    : review?.status === 'goals_set'
      ? 'Step 2: Goals are locked. Open results to start result entry.'
      : review?.status === 'active' || review?.status === 'results_pending'
        ? resultsReadyToSubmit
          ? 'Step 3: Results complete. Save draft or submit for review.'
          : 'Step 3: Fill all result fields, save draft, then submit for review.'
        : review?.status === 'under_review'
          ? 'Step 4: Review submitted. Close review when finalized.'
          : null;

  return (
    <div className="employee-kpi-drawer-overlay">
      <div className="employee-kpi-drawer smart-kpi-sheet-drawer">
        <div className="employee-kpi-drawer-header">
          <div>
            <h2>{review?.employee_name || 'SMART KPI Sheet'}</h2>
            <p>
              {review?.emp_no ? `${review.emp_no} · ` : ''}
              {review?.designation_title || ''}
              {review?.department_name ? ` · ${review.department_name}` : ''}
              {review ? ` · ${review.period_type} ${review.period_key}` : ''}
            </p>
          </div>
          <button type="button" className="employee-kpi-drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="employee-kpi-drawer-body">
          {isFetching && !review ? (
            <div className="employee-kpi-loading">Loading sheet…</div>
          ) : (
            <>
              <div className="smart-kpi-sheet-summary">
                <div className="employee-kpi-card">
                  <div className="employee-kpi-card-label">Composite score</div>
                  <div className="employee-kpi-card-value">{review?.composite_score ?? '—'}</div>
                  <div className="employee-kpi-card-sub">{review?.rating_label || review?.status}</div>
                </div>
                <div className="smart-kpi-sheet-actions">
                  {WORKFLOW_BUTTONS.filter((b) => nextWorkflowActions.includes(b.action)).map((b) => (
                    <button
                      key={b.action}
                      type="button"
                      className="employee-kpi-btn employee-kpi-btn-secondary"
                      disabled={
                        workflowLoading
                        || savingGoals
                        || savingResults
                        || (b.action === 'lock_goals' && !goalsReadyToLock)
                        || (b.action === 'submit_results' && !resultsReadyToSubmit)
                      }
                      onClick={() => {
                        if (b.action === 'lock_goals') lockGoalsWithSave();
                        else if (b.action === 'submit_results') submitResultsWithSave();
                        else runWorkflow(b.action);
                      }}
                      title={
                        b.action === 'lock_goals' && !goalsReadyToLock
                          ? goalValidationErrors[0] || 'Complete all required goal fields before locking.'
                          : b.action === 'submit_results' && !resultsReadyToSubmit
                            ? resultValidationErrors[0] || 'Complete all result fields before submitting.'
                            : undefined
                      }
                    >
                      {b.action === 'lock_goals' && (savingGoals || workflowLoading)
                        ? 'Locking…'
                        : b.action === 'submit_results' && (savingResults || workflowLoading)
                          ? 'Submitting…'
                          : b.label}
                    </button>
                  ))}
                  {!goalsLocked ? (
                    <button
                      type="button"
                      className="employee-kpi-btn employee-kpi-btn-primary"
                      disabled={savingGoals}
                      onClick={saveGoalValues}
                    >
                      {savingGoals ? 'Saving…' : 'Save goals'}
                    </button>
                  ) : null}
                  {canEditResults ? (
                    <button
                      type="button"
                      className="employee-kpi-btn employee-kpi-btn-primary"
                      disabled={savingResults}
                      onClick={saveResultValues}
                    >
                      {savingResults ? 'Saving…' : 'Save results'}
                    </button>
                  ) : null}
                </div>
              </div>

              {stepHint ? (
                <div className="employee-kpi-card-sub" style={{ marginBottom: 12 }}>
                  {stepHint}
                </div>
              ) : null}

              {message ? (
                <div className={message.type === 'error' ? 'employee-kpi-error' : 'smart-kpi-success-msg'}>
                  {message.text}
                </div>
              ) : null}

              <div className="smart-kpi-sheet-table-wrap">
                <table className="smart-kpi-sheet-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Goal</th>
                      <th>Result</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className="smart-kpi-type-cell">
                          <span className="smart-kpi-letter">{item.dimension_letter}</span>
                          <div>{item.dimension_name}</div>
                          <div className="employee-kpi-muted">{item.title}</div>
                        </td>
                        <td>
                          <textarea
                            rows={3}
                            className="smart-kpi-desc-input"
                            value={item.description_text}
                            onChange={(e) => updateItem(index, { description_text: e.target.value })}
                            disabled={goalsLocked}
                            placeholder={item.guidance_text || 'Describe the KPI…'}
                          />
                        </td>
                        <td>
                          <SmartKpiFieldRenderer
                            schema={item.goal_field_schema}
                            values={item.goal_values}
                            onChange={(next) => updateItem(index, { goal_values: next })}
                            readOnly={goalsLocked}
                            mode="goal"
                            fieldTypes={fieldTypes}
                          />
                        </td>
                        <td>
                          <SmartKpiFieldRenderer
                            schema={item.result_field_schema}
                            values={item.result_values}
                            onChange={(next) => updateItem(index, { result_values: next })}
                            readOnly={!canEditResults}
                            mode="result"
                            fieldTypes={fieldTypes}
                          />
                        </td>
                        <td className="employee-kpi-score">{item.item_score ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
