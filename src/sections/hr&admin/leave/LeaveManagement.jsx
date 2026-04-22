import React, { useMemo, useState } from 'react';
import {
  useCreateHrLeaveRequestMutation,
  useDecideHrLeaveRequestMutation,
  useGetHrApprovalsInboxQuery,
  useGetHrLeaveTypesQuery,
  useGetHrMyLeaveRequestsQuery
} from '../../../api/services NodeJs/hrLeaveApi';
import '../../../styles/leavemanagement.css';

const LeaveManagement = () => {
  const [filters, setFilters] = useState({ yearMonth: '', status: '' });
  const [form, setForm] = useState({
    leaveTypeCode: 'annual_leave',
    requestMode: 'full_day',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const { data: leaveTypeResponse } = useGetHrLeaveTypesQuery();
  const { data: myRequestsResponse, refetch: refetchMine } = useGetHrMyLeaveRequestsQuery(filters);
  const { data: inboxResponse, refetch: refetchInbox } = useGetHrApprovalsInboxQuery({});
  const [createLeaveRequest, { isLoading: submitting }] = useCreateHrLeaveRequestMutation();
  const [decideLeaveRequest, { isLoading: deciding }] = useDecideHrLeaveRequestMutation();
  const [message, setMessage] = useState('');

  const leaveTypes = leaveTypeResponse?.data || [];
  const myRequests = myRequestsResponse?.data || [];
  const inbox = inboxResponse?.data || [];

  const canSubmit = useMemo(() => {
    return form.leaveTypeCode && form.startDate;
  }, [form]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      await createLeaveRequest({
        ...form,
        endDate: form.endDate || form.startDate
      }).unwrap();
      setMessage('Leave request submitted');
      setForm((prev) => ({ ...prev, reason: '' }));
      refetchMine();
      refetchInbox();
    } catch (error) {
      setMessage(error?.data?.message || 'Failed to submit request');
    }
  };

  const onDecision = async (requestId, action) => {
    try {
      await decideLeaveRequest({ requestId, action }).unwrap();
      setMessage(`Request ${action}d`);
      refetchMine();
      refetchInbox();
    } catch (error) {
      setMessage(error?.data?.message || `Failed to ${action}`);
    }
  };

  return (
    <div className="leave-page-leavemgt">
      <div className="leave-header-leavemgt">
        <h2>Leave Management</h2>
        <p>Employee requests, approval queue, and two-step approval flow</p>
      </div>

      <div className="leave-grid-leavemgt">
        <form onSubmit={onSubmit} className="leave-card-leavemgt leave-form-leavemgt">
          <h3>Create Leave Request</h3>
          <select className="leave-input-leavemgt" value={form.leaveTypeCode} onChange={(e) => setForm((prev) => ({ ...prev, leaveTypeCode: e.target.value }))}>
          {leaveTypes.map((leaveType) => (
            <option key={leaveType.code} value={leaveType.code}>
              {leaveType.name}
            </option>
          ))}
          </select>
          <select className="leave-input-leavemgt" value={form.requestMode} onChange={(e) => setForm((prev) => ({ ...prev, requestMode: e.target.value }))}>
            <option value="full_day">Full Day</option>
            <option value="half_day">Half Day</option>
            <option value="short">Short Leave</option>
          </select>
          <div className="leave-row-leavemgt">
            <input className="leave-input-leavemgt" type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
            <input className="leave-input-leavemgt" type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
          </div>
          <textarea
            className="leave-input-leavemgt leave-textarea-leavemgt"
            value={form.reason}
            placeholder="Notes"
            onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
            rows={3}
          />
          <button className="leave-btn-leavemgt leave-btn-primary-leavemgt" type="submit" disabled={!canSubmit || submitting}>
            {submitting ? 'Submitting...' : 'Submit Leave'}
          </button>
        </form>

        <div className="leave-card-leavemgt">
          <h3>My Requests</h3>
          <div className="leave-row-leavemgt leave-filter-row-leavemgt">
            <input className="leave-input-leavemgt" type="month" value={filters.yearMonth} onChange={(e) => setFilters((prev) => ({ ...prev, yearMonth: e.target.value }))} />
            <select className="leave-input-leavemgt" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="">All</option>
              <option value="pending_l1">Pending L1</option>
              <option value="pending_l2">Pending L2</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="leave-btn-leavemgt leave-btn-secondary-leavemgt" type="button" onClick={() => refetchMine()}>Refresh</button>
          </div>
          <div className="leave-list-leavemgt">
            {myRequests.length === 0 && <div className="leave-empty-leavemgt">No requests found.</div>}
            {myRequests.map((request) => (
              <div key={request.id} className="leave-item-leavemgt">
                <strong>{request.leaveTypeName}</strong> ({request.request_mode})<br />
                {request.start_date} to {request.end_date} - {request.current_status}
              </div>
            ))}
          </div>
        </div>

        <div className="leave-card-leavemgt leave-span-2-leavemgt">
          <h3>Approvals Inbox</h3>
          <div className="leave-list-leavemgt">
            {inbox.length === 0 && <div className="leave-empty-leavemgt">No pending approvals.</div>}
            {inbox.map((request) => (
              <div key={request.id} className="leave-item-leavemgt">
                <strong>{request.employeeName}</strong> - {request.leaveTypeName}<br />
                {request.start_date} to {request.end_date} ({request.current_status})
                <div className="leave-row-leavemgt leave-actions-leavemgt">
                  <button className="leave-btn-leavemgt leave-btn-approve-leavemgt" type="button" disabled={deciding} onClick={() => onDecision(request.id, 'approve')}>Approve</button>
                  <button className="leave-btn-leavemgt leave-btn-reject-leavemgt" type="button" disabled={deciding} onClick={() => onDecision(request.id, 'reject')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {message ? (
        <div className={`leave-message-leavemgt ${message.toLowerCase().includes('failed') ? 'error-leavemgt' : 'success-leavemgt'}`}>
          {message}
        </div>
      ) : null}
    </div>
  );
};

export default LeaveManagement;
