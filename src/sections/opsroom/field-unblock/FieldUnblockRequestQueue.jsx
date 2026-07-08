import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { Bars } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  useGetFieldUnblockRequestsListQuery,
  useApproveFieldUnblockRequestMutation,
  useDeclineFieldUnblockRequestMutation,
} from '../../../api/services NodeJs/fieldUnblockRequestsApi';
import './fieldUnblockRequestQueue.css';

function missionLabel(code) {
  const m = String(code || '').toLowerCase();
  if (m === 'spy' || m === 'spray') return 'Spray';
  if (m === 'spd' || m === 'spread') return 'Spread';
  return code || '—';
}

function categoryLabel(id) {
  const m = {
    problem_solved: 'Problem solved',
    no_issue: 'No issue',
    wrong_reason: 'Wrong reason',
    other: 'Other',
  };
  return m[String(id || '').toLowerCase()] || id || '—';
}

const FieldUnblockRequestQueue = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const go = (path) => navigate({ pathname: path, search: routerLocation.search });

  const { data: rows = [], isLoading, isFetching, isError, refetch } =
    useGetFieldUnblockRequestsListQuery(
      { status: 'p' },
      { refetchOnMountOrArgChange: true, refetchOnFocus: true }
    );

  const [approve, { isLoading: approving }] = useApproveFieldUnblockRequestMutation();
  const [decline, { isLoading: declining }] = useDeclineFieldUnblockRequestMutation();
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
    const note = modalNote.trim();

    setBusyId(row.id);
    try {
      if (action === 'approve') {
        await approve({ id: row.id, reviewNote: note }).unwrap();
        toast.success(`${row.fieldName || `Field #${row.fieldId}`} unblocked for ${missionLabel(row.missionType)}`);
      } else {
        await decline({ id: row.id, reviewNote: note }).unwrap();
        toast.success('Request rejected');
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
    <div className="page-fur-queue">
      <ToastContainer position="top-right" autoClose={4000} />
      <header className="header-fur-queue">
        <div className="header-start-fur-queue">
          <button type="button" className="back-btn-fur-queue" onClick={() => go('/home/geo-spatial/dashboard')}>
            <FaArrowLeft /> Back
          </button>
          <h1 className="title-fur-queue">Field unblock requests</h1>
        </div>
      </header>

      {(isLoading || isFetching) && list.length === 0 && (
        <div className="loading-fur-queue">
          <Bars height={40} width={40} color="#2d8659" />
          <span>Loading…</span>
        </div>
      )}

      {isError && <div className="error-fur-queue">Failed to load requests.</div>}

      {!isLoading && !isError && list.length === 0 && (
        <p className="empty-fur-queue">No pending field unblock requests.</p>
      )}

      {list.length > 0 && (
        <div className="table-wrap-fur-queue">
          <table className="table-fur-queue">
            <thead>
              <tr>
                <th>ID</th>
                <th>Field</th>
                <th>Estate / division</th>
                <th>Category</th>
                <th>Message</th>
                <th>Block reason</th>
                <th>Requested by</th>
                <th>Requested at</th>
                <th className="th-actions-fur-queue">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    <strong>{row.fieldName || row.shortName || `#${row.fieldId}`}</strong>
                    {row.fieldArea > 0 ? (
                      <div className="cell-meta-fur-queue">{row.fieldArea.toFixed(2)} Ha</div>
                    ) : null}
                  </td>
                  <td>
                    {row.estateName || '—'}
                    {row.divisionName ? (
                      <div className="cell-meta-fur-queue">{row.divisionName}</div>
                    ) : null}
                  </td>
                  <td>{categoryLabel(row.requestCategory)}</td>
                  <td className="message-cell-fur-queue">{row.requestMessage}</td>
                  <td className="message-cell-fur-queue block-reason-fur-queue">
                    {row.blockReason ||
                      (String(row.missionType).toLowerCase() === 'spy'
                        ? row.blockReasonSpray
                        : row.blockReasonSpread) ||
                      '—'}
                  </td>
                  <td>{row.requestedByName || row.requestedByUserId}</td>
                  <td>{row.requestedAt ? String(row.requestedAt).slice(0, 16).replace('T', ' ') : '—'}</td>
                  <td>
                    <div className="icon-actions-fur-queue">
                      <button
                        type="button"
                        className="icon-btn-fur-queue icon-btn-fur-queue--approve"
                        title="Approve unblock"
                        aria-label={`Approve request ${row.id}`}
                        disabled={isBusy}
                        onClick={() => openActionModal(row, 'approve')}
                      >
                        <FaCheck />
                      </button>
                      <button
                        type="button"
                        className="icon-btn-fur-queue icon-btn-fur-queue--reject"
                        title="Reject request"
                        aria-label={`Reject request ${row.id}`}
                        disabled={isBusy}
                        onClick={() => openActionModal(row, 'reject')}
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
            aria-labelledby="fur-action-modal-title"
          >
            <div className="modal-head-fur-queue">
              <h2 id="fur-action-modal-title" className="modal-title-fur-queue">
                {isApproveModal ? 'Approve unblock' : 'Reject request'}
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
                <strong>{modalRow.fieldName || modalRow.shortName || `Field #${modalRow.fieldId}`}</strong>
                {' · '}
                {missionLabel(modalRow.missionType)}
                {modalRow.estateName ? ` · ${modalRow.estateName}` : ''}
              </p>
              <p className="modal-hint-fur-queue">
                {isApproveModal
                  ? 'Field will be unblocked for this mission. Add an ops note if needed.'
                  : 'Request will be rejected. Add a note explaining why (optional).'}
              </p>
              <label className="modal-label-fur-queue" htmlFor="fur-review-note">
                Ops note
              </label>
              <textarea
                id="fur-review-note"
                className="modal-textarea-fur-queue"
                rows={4}
                placeholder={isApproveModal ? 'Optional note for records…' : 'Reason for rejection (optional)…'}
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
                {isBusy ? 'Please wait…' : isApproveModal ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FieldUnblockRequestQueue;
