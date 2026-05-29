import React, { useMemo, useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { Bars } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import {
  useGetPlanActivateRequestsListQuery,
  useApprovePlanActivateRequestMutation,
  useDeclinePlanActivateRequestMutation,
} from '../../../api/services NodeJs/planActivateRequestsApi';
import '../../opsroom/field-unblock/fieldUnblockRequestQueue.css';

function formatDt(val) {
  if (!val) return '—';
  return String(val).slice(0, 16).replace('T', ' ');
}

const PlanActivateRequestQueue = () => {
  const {
    data: rows = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPlanActivateRequestsListQuery(
    { status: 'pending' },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true }
  );

  const [approve, { isLoading: approving }] = useApprovePlanActivateRequestMutation();
  const [decline, { isLoading: declining }] = useDeclinePlanActivateRequestMutation();
  const [busyId, setBusyId] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [modalNote, setModalNote] = useState('');

  const list = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const isBusy = busyId != null || approving || declining;

  const openActionModal = (row, action) => {
    setActionModal({ row, action });
    setModalNote('');
  };

  const closeActionModal = () => {
    if (isBusy) return;
    setActionModal(null);
    setModalNote('');
  };

  const submitAction = async () => {
    if (!actionModal) return;
    const { row, action } = actionModal;
    setBusyId(row.id);
    try {
      if (action === 'approve') {
        await approve({ id: row.id, reviewNote: modalNote }).unwrap();
        toast.success(`Plan #${row.planId} activated`);
      } else {
        await decline({ id: row.id, reviewNote: modalNote }).unwrap();
        toast.success('Activation request declined');
      }
      closeActionModal();
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || e?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const modalRow = actionModal?.row;
  const isApproveModal = actionModal?.action === 'approve';

  return (
    <div className="page-fur-queue plan-activate-request-queue">
      <p className="plan-activate-queue-intro">
        Opsroom activation requests for deactivated plans. Approving sets the plan active again and clears deactivation details.
      </p>

      {(isLoading || isFetching) && list.length === 0 && (
        <div className="loading-fur-queue">
          <Bars height={40} width={40} color="#003057" />
          <span>Loading requests…</span>
        </div>
      )}

      {isError && <div className="error-fur-queue">Failed to load activation requests.</div>}

      {!isLoading && !isError && list.length === 0 && (
        <div className="empty-fur-queue">No pending activation requests.</div>
      )}

      {list.length > 0 && (
        <div className="table-wrap-fur-queue">
          <table className="table-fur-queue">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Estate / date</th>
                <th>Deactivation</th>
                <th>Requested</th>
                <th className="th-actions-fur-queue">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>#{row.planId}</strong>
                    {row.totalExtent != null && (
                      <div className="cell-meta-fur-queue">{row.totalExtent} ha</div>
                    )}
                  </td>
                  <td>
                    <div>{row.estateName || '—'}</div>
                    <div className="cell-meta-fur-queue">
                      {row.pickedDate ? String(row.pickedDate).slice(0, 10) : '—'}
                    </div>
                  </td>
                  <td>
                    <div>{row.deactivateReason || '—'}</div>
                    <div className="cell-meta-fur-queue">
                      {row.deactivatedByName ? `By ${row.deactivatedByName}` : ''}
                      {row.deactivatedAt ? ` · ${formatDt(row.deactivatedAt)}` : ''}
                    </div>
                    {row.requestMessage && (
                      <div className="cell-meta-fur-queue">Note: {row.requestMessage}</div>
                    )}
                  </td>
                  <td>
                    <div>{row.requestedByName || `User #${row.requestedByUserId}`}</div>
                    <div className="cell-meta-fur-queue">{formatDt(row.requestedAt)}</div>
                  </td>
                  <td>
                    <div className="icon-actions-fur-queue">
                      <button
                        type="button"
                        className="icon-btn-fur-queue icon-btn-fur-queue--approve"
                        title="Approve and activate plan"
                        aria-label={`Approve request ${row.id}`}
                        disabled={isBusy}
                        onClick={() => openActionModal(row, 'approve')}
                      >
                        <FaCheck />
                      </button>
                      <button
                        type="button"
                        className="icon-btn-fur-queue icon-btn-fur-queue--reject"
                        title="Decline request"
                        aria-label={`Decline request ${row.id}`}
                        disabled={isBusy}
                        onClick={() => openActionModal(row, 'decline')}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionModal && modalRow ? (
        <div className="modal-overlay-fur-queue" onClick={closeActionModal} role="presentation">
          <div
            className="modal-panel-fur-queue"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-activate-action-modal-title"
          >
            <div className="modal-head-fur-queue">
              <h2 id="plan-activate-action-modal-title" className="modal-title-fur-queue">
                {isApproveModal ? 'Approve activation' : 'Decline activation'}
              </h2>
              <button
                type="button"
                className="modal-close-fur-queue"
                onClick={closeActionModal}
                disabled={isBusy}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body-fur-queue">
              <p className="modal-summary-fur-queue">
                <strong>Plan #{modalRow.planId}</strong>
                {modalRow.estateName ? ` · ${modalRow.estateName}` : ''}
                {modalRow.pickedDate ? ` · ${String(modalRow.pickedDate).slice(0, 10)}` : ''}
              </p>
              {modalRow.deactivateReason ? (
                <p className="modal-hint-fur-queue">
                  Deactivation reason: {modalRow.deactivateReason}
                </p>
              ) : null}
              <p className="modal-hint-fur-queue">
                {isApproveModal
                  ? 'The plan will be set active again and deactivation details will be cleared.'
                  : 'The activation request will be declined. Add a note if needed (optional).'}
              </p>
              <label className="modal-label-fur-queue" htmlFor="plan-activate-review-note">
                Review note
              </label>
              <textarea
                id="plan-activate-review-note"
                className="modal-textarea-fur-queue"
                rows={4}
                placeholder={isApproveModal ? 'Optional note for records…' : 'Reason for declining (optional)…'}
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                disabled={isBusy}
              />
            </div>
            <div className="modal-footer-fur-queue">
              <button type="button" className="btn-modal-cancel-fur-queue" onClick={closeActionModal} disabled={isBusy}>
                Cancel
              </button>
              <button
                type="button"
                className={isApproveModal ? 'btn-modal-confirm-fur-queue' : 'btn-modal-reject-fur-queue'}
                onClick={submitAction}
                disabled={isBusy}
              >
                {isBusy ? 'Please wait…' : isApproveModal ? 'Approve & activate' : 'Decline request'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PlanActivateRequestQueue;
