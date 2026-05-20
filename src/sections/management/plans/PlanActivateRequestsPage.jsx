import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlanActivateRequestQueue from './PlanActivateRequestQueue';
import { useGetPlanActivatePendingCountQuery } from '../../../api/services NodeJs/planActivateRequestsApi';
import '../../opsroom/field-unblock/fieldUnblockRequestQueue.css';

const PlanActivateRequestsPage = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const go = (path) => navigate({ pathname: path, search: routerLocation.search });
  const { data: pendingPayload } = useGetPlanActivatePendingCountQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const pendingCount = Number(pendingPayload?.count ?? 0);

  return (
    <div className="page-fur-queue">
      <ToastContainer position="top-right" autoClose={4000} />
      <header className="header-fur-queue">
        <div className="header-start-fur-queue">
          <button type="button" className="back-btn-fur-queue" onClick={() => go('/home/create')}>
            <FaArrowLeft /> Back to Forecast
          </button>
          <h1 className="title-fur-queue">
            Activate requests
            {pendingCount > 0 && (
              <span className="pending-count pending-count--mini pending-count--activate" style={{ marginLeft: 10 }}>
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </h1>
        </div>
      </header>
      <PlanActivateRequestQueue />
    </div>
  );
};

export default PlanActivateRequestsPage;
