import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCheckCircle,
  FaPlayCircle,
  FaBell,
  FaFlag,
  FaTimesCircle,
  FaTint,
  FaImage,
  FaStar,
  FaExpand,
  FaTimes,
  FaSync,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaClock,
  FaMapMarked,
  FaUserCog,
  FaClipboardList,
} from 'react-icons/fa';
import { useGetMonitoringDashboardDataQuery } from '../../../api/services NodeJs/monitoringDashboardApi';
import { useGetPendingAdHocRequestsQuery, useGetPendingRescheduleRequestsByManagerQuery } from '../../../api/services/requestsApi';
import { getUserData } from '../../../utils/authUtils';
import { COMPANY } from '../../../config/companyConstants';
import '../../../styles/monitoringDashboard.css';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const MonitoringDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userData = getUserData();
  const userGroupId = userData.group;
  const logoUrl = 'https://drone-admin.kenilworthinternational.com/storage/image/logo/';
  const companyLogo = userGroupId !== 0 ? `${logoUrl}${userGroupId}.png` : `${logoUrl}000.png`;

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const formatSyncTime = (date) => {
    if (!date) return '--:--:--';
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  // Fetch main dashboard data from Node.js backend (5 min auto-refresh)
  const { data: dashboardResponse, isLoading, isError, refetch, isFetching } = useGetMonitoringDashboardDataQuery(
    null,
    {
      pollingInterval: REFRESH_INTERVAL,
      refetchOnMountOrArgChange: true,
    }
  );

  // Fetch Plan Request data from PHP backend (ad-hoc + reschedule)
  const {
    data: adhocData,
    refetch: refetchAdhoc,
    isFetching: isFetchingAdhoc,
  } = useGetPendingAdHocRequestsQuery(undefined, {
    pollingInterval: REFRESH_INTERVAL,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: rescheduleData,
    refetch: refetchReschedule,
    isFetching: isFetchingReschedule,
  } = useGetPendingRescheduleRequestsByManagerQuery(undefined, {
    pollingInterval: REFRESH_INTERVAL,
    refetchOnMountOrArgChange: true,
  });

  const dashboardData = dashboardResponse?.data || {};

  // Process Plan Request data
  const adhocCount = adhocData?.status === 'true' ? (adhocData.request_count || 0) : 0;
  const adhocRequests = adhocData?.requests || [];
  const rescheduleRequests = rescheduleData?.requests || [];
  const rescheduleCount = rescheduleRequests.length;

  // Build plan request items for display
  const planRequestItems = [
    { type: 'adhoc', label: 'Ad-hoc Plans', count: adhocCount, items: adhocRequests },
    { type: 'reschedule', label: 'Reschedule Request Plans', count: rescheduleCount, items: rescheduleRequests },
  ];
  const totalPlanRequests = adhocCount + rescheduleCount;

  // Track last sync time
  useEffect(() => {
    if (dashboardResponse && !isFetching && !isFetchingAdhoc && !isFetchingReschedule) {
      setLastSyncTime(new Date());
      setIsRefreshing(false);
    }
  }, [dashboardResponse, isFetching, isFetchingAdhoc, isFetchingReschedule]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Manual refresh - refresh ALL APIs
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetch();
    refetchAdhoc();
    refetchReschedule();
  }, [refetch, refetchAdhoc, refetchReschedule]);

  // Elapsed time since start (seconds)
  const getElapsedTime = useCallback((startTime) => {
    if (!startTime) return null;
    const now = currentTime;
    const startStr = String(startTime).trim();
    const timeMatch = startStr.match(/(\d{2}:\d{2}:\d{2})/);
    if (!timeMatch) return null;
    const [hours, minutes, seconds] = timeMatch[1].split(':').map(Number);
    if ([hours, minutes, seconds].some((n) => Number.isNaN(n))) return null;
    const startDate = new Date(now);
    startDate.setHours(hours, minutes, seconds, 0);
    const diff = Math.max(0, Math.floor((now - startDate) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return {
      display: `${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`,
      hours: h, minutes: m, seconds: s,
      totalSeconds: diff,
    };
  }, [currentTime]);

  // Countdown remaining: minutes per Ha from COMPANY.minutesPerHa (e.g. 30 = 1 Ha per 30 min); count down to 0
  const getCountdownRemaining = useCallback((startTime, waypointArea) => {
    const elapsed = getElapsedTime(startTime);
    if (!elapsed || !waypointArea || waypointArea <= 0) return null;
    const minutesPerHa = COMPANY.minutesPerHa ?? 30;
    const totalMinutes = waypointArea * minutesPerHa;
    const totalSeconds = Math.floor(totalMinutes * 60);
    const remainingSeconds = Math.max(0, totalSeconds - elapsed.totalSeconds);
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    return {
      display: `${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`,
      remainingSeconds,
    };
  }, [getElapsedTime]);

  // Close expanded card on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setExpandedCard(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (isLoading) {
    return (
      <div className="monitoring-dashboard">
        <div className="monitoring-loading">
          <div className="monitoring-spinner" />
          <span className="monitoring-loading-text">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="monitoring-dashboard">
        <div className="monitoring-error">
          <span className="monitoring-error-icon">!</span>
          <span className="monitoring-error-text">Failed to load monitoring data</span>
          <button className="monitoring-retry-btn" onClick={handleManualRefresh}>Retry</button>
        </div>
      </div>
    );
  }

  const {
    totalActivities = 0,
    managerApprovals = [],
    pilotStartMissions = [],
    droneUnlockRequests = [],
    pilotCompleteMissions = [],
    comOperatorAssign = [],
    pilotCancelMissions = [],
    waterChemicalTimes = [],
    djiMapUploads = [],
    dayEndCompleted = [],
  } = dashboardData;

  // Card definitions for expand modal
  const cardSections = {
    managerApprovals: { title: 'Manager Approval', data: managerApprovals, headerColor: 'green' },
    pilotStartMissions: { title: 'Pilot - Start Mission', data: pilotStartMissions, headerColor: 'blue' },
    droneUnlockRequests: { title: 'Drone Unlock Requests', data: droneUnlockRequests, headerColor: 'amber' },
    pilotCompleteMissions: { title: 'Pilot - Complete / Partial Complete Mission', data: pilotCompleteMissions, headerColor: 'green' },
    comOperatorAssign: { title: 'COM Operator Assign', data: comOperatorAssign, headerColor: 'purple' },
    pilotCancelMissions: { title: 'Pilot - Cancel Mission', data: pilotCancelMissions, headerColor: 'red' },
    waterChemicalTimes: { title: 'Pilot - Water & Chemical Times', data: waterChemicalTimes, headerColor: 'teal' },
    djiMapUploads: { title: 'DJI Map Upload', data: djiMapUploads, headerColor: 'lightblue' },
    dayEndCompleted: { title: 'Day End Complete', data: dayEndCompleted, headerColor: 'pink' },
    planRequests: { title: 'Plan Request', data: planRequestItems, headerColor: 'red' },
  };

  // Time since last sync - always show minutes and seconds
  const getTimeSinceSync = () => {
    if (!lastSyncTime) return '';
    const diff = Math.floor((currentTime - lastSyncTime) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s ago`;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s ago`;
    return `${s}s ago`;
  };

  const anyFetching = isRefreshing || isFetching || isFetchingAdhoc || isFetchingReschedule;

  return (
    <div className="monitoring-dashboard">
      {/* Header */}
      <div className="monitoring-header">
        <div className="monitoring-header-left">
          <img src={companyLogo} alt="Logo" className="monitoring-logo" />
        </div>
        <div className="monitoring-header-center">
          <h1 className="monitoring-title">Operations Monitoring Dashboard</h1>
          <p className="monitoring-subtitle">Total Activities: {totalActivities}</p>
        </div>
        <div className="monitoring-header-right">
          <div className="monitoring-sync-container">
            <div className="monitoring-sync-details">
              <span className="monitoring-sync-label">LAST SYNC</span>
              <span className="monitoring-sync-time">{formatSyncTime(lastSyncTime)}</span>
              <span className="monitoring-sync-ago">{getTimeSinceSync()}</span>
            </div>
            <button
              className={`monitoring-refresh-btn ${anyFetching ? 'spinning' : ''}`}
              onClick={handleManualRefresh}
              disabled={anyFetching}
              title="Refresh now"
            >
              <FaSync />
              <span className="monitoring-refresh-label">{anyFetching ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
          <span className="monitoring-date-badge">{formatDate(new Date())}</span>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="monitoring-grid">

        {/* 1. Manager Approval */}
        <DashboardCard
          title="Manager Approval"
          count={managerApprovals.length}
          headerColor="green"
          onExpand={() => setExpandedCard('managerApprovals')}
        >
          {managerApprovals.length === 0 ? (
            <div className="monitoring-empty">No pending approvals</div>
          ) : (
            managerApprovals.map((item, idx) => (
              <ManagerApprovalItem key={`ma-${idx}`} item={item} />
            ))
          )}
        </DashboardCard>

        {/* 2. Pilot - Start Mission */}
        <DashboardCard
          title="Pilot - Start Mission"
          count={pilotStartMissions.length}
          headerColor="blue"
          onExpand={() => setExpandedCard('pilotStartMissions')}
        >
          {pilotStartMissions.length === 0 ? (
            <div className="monitoring-empty">No active missions</div>
          ) : (
            pilotStartMissions.map((item, idx) => (
              <PilotStartItem key={`psm-${idx}`} item={item} getElapsedTime={getElapsedTime} getCountdownRemaining={getCountdownRemaining} />
            ))
          )}
        </DashboardCard>

        {/* 3. Drone Unlock Requests */}
        <DashboardCard
          title="Drone Unlock Requests"
          count={droneUnlockRequests.length}
          headerColor="amber"
          onExpand={() => setExpandedCard('droneUnlockRequests')}
        >
          {droneUnlockRequests.length === 0 ? (
            <div className="monitoring-empty">No unlock requests</div>
          ) : (
            droneUnlockRequests.map((item, idx) => (
              <DroneUnlockItem key={`dur-${idx}`} item={item} />
            ))
          )}
        </DashboardCard>

        {/* 4. Pilot - Complete / Partial Complete Mission */}
        <DashboardCard
          title="Pilot - Complete / Partial Complete Mission"
          count={pilotCompleteMissions.length}
          headerColor="green"
          onExpand={() => setExpandedCard('pilotCompleteMissions')}
        >
          {pilotCompleteMissions.length === 0 ? (
            <div className="monitoring-empty">No completed missions</div>
          ) : (
            pilotCompleteMissions.map((item, idx) => (
              <PilotCompleteItem key={`pcm-${idx}`} item={item} />
            ))
          )}
        </DashboardCard>

        {/* 5. COM Operator Assign */}
        <DashboardCard
          title="COM Operator Assign"
          count={comOperatorAssign.length}
          headerColor="purple"
          onExpand={() => setExpandedCard('comOperatorAssign')}
        >
          {comOperatorAssign.length === 0 ? (
            <div className="monitoring-empty">No operator assignments today</div>
          ) : (
            comOperatorAssign.map((item, idx) => (
              <COMOperatorAssignItem key={`coa-${idx}`} item={item} />
            ))
          )}
        </DashboardCard>

        {/* 6. Pilot - Cancel Mission */}
        <DashboardCard
          title="Pilot - Cancel Mission"
          count={pilotCancelMissions.length}
          headerColor="red"
          onExpand={() => setExpandedCard('pilotCancelMissions')}
        >
          {pilotCancelMissions.length === 0 ? (
            <div className="monitoring-empty">No cancelled missions</div>
          ) : (
            pilotCancelMissions.map((item, idx) => (
              <PilotCancelItem key={`pcnl-${idx}`} item={item} />
            ))
          )}
        </DashboardCard>

        {/* 7. Pilot - Water & Chemical Times */}
        <DashboardCard
          title="Pilot - Water & Chemical Times"
          count={waterChemicalTimes.length}
          headerColor="teal"
          onExpand={() => setExpandedCard('waterChemicalTimes')}
        >
          {waterChemicalTimes.length === 0 ? (
            <div className="monitoring-empty">No water/chemical data</div>
          ) : (
            waterChemicalTimes.map((item, idx) => (
              <WaterChemicalItem key={`wct-${idx}`} item={item} />
            ))
          )}
        </DashboardCard>

        {/* 8. DJI Map Upload */}
        <DashboardCard
          title="DJI Map Upload"
          count={djiMapUploads.length}
          headerColor="lightblue"
          onExpand={() => setExpandedCard('djiMapUploads')}
        >
          {djiMapUploads.length === 0 ? (
            <div className="monitoring-empty">No uploads today</div>
          ) : (
            djiMapUploads.map((item, idx) => (
              <DjiUploadItem key={`dji-${idx}`} item={item} />
            ))
          )}
        </DashboardCard>

        {/* 9. Day End Complete */}
        <DashboardCard
          title="Day End Complete"
          count={dayEndCompleted.length}
          headerColor="pink"
          onExpand={() => setExpandedCard('dayEndCompleted')}
        >
          {dayEndCompleted.length === 0 ? (
            <div className="monitoring-empty">No day-end completions</div>
          ) : (
            dayEndCompleted.map((item, idx) => (
              <DayEndItem key={`dec-${idx}`} item={item} />
            ))
          )}
        </DashboardCard>

        {/* 10. Plan Request (Ad-hoc + Reschedule) */}
        <DashboardCard
          title="Plan Request"
          count={totalPlanRequests}
          headerColor="red"
          onExpand={() => setExpandedCard('planRequests')}
        >
          <PlanRequestCard
            adhocCount={adhocCount}
            rescheduleCount={rescheduleCount}
            navigate={navigate}
          />
        </DashboardCard>

      </div>

      {/* Expanded Card Modal */}
      {expandedCard && cardSections[expandedCard] && (
        <ExpandedCardModal
          section={cardSections[expandedCard]}
          cardKey={expandedCard}
          onClose={() => setExpandedCard(null)}
          getElapsedTime={getElapsedTime}
          getCountdownRemaining={getCountdownRemaining}
          navigate={navigate}
          adhocCount={adhocCount}
          rescheduleCount={rescheduleCount}
          adhocRequests={adhocRequests}
          rescheduleRequests={rescheduleRequests}
        />
      )}
    </div>
  );
};

/* =====================================================
   ITEM COMPONENTS (reused in grid cards & expanded modal)
   ===================================================== */

const ManagerApprovalItem = ({ item }) => (
  <div className="monitoring-item">
    <div className="monitoring-item-icon green"><FaCheckCircle /></div>
    <div className="monitoring-item-content">
      <div className="monitoring-item-top">
        <span className="monitoring-item-id">ID: {item.planId}</span>
        <span className="monitoring-item-field">{item.estateName}</span>
        <div className="monitoring-item-datetime">
          <span className="monitoring-item-date">{item.approvedDate}</span>
          <span className="monitoring-item-time">{item.time}</span>
        </div>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">
          Estate Manager : {item.managerName}
          <span className="detail-separator">|</span>
          {item.managerPhone}
        </span>
      </div>
      {item.fields && item.fields.length > 0 && (
        <div className="monitoring-division-details">
          {item.fields.map((field, i) => (
            <span 
              key={i} 
              className={`monitoring-division-chip ${field.managerApproval === 1 ? 'approved' : 'not-approved'}`}
              title={`${field.fieldName} - Manager Approval: ${field.managerApproval === 1 ? 'Approved' : 'Not Approved'}`}
            >
              {field.fieldName} - {field.fieldArea} Ha
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const PilotStartItem = ({ item, getElapsedTime, getCountdownRemaining }) => (
  <div className="monitoring-item">
    <div className="monitoring-item-icon blue"><FaPlayCircle /></div>
    <div className="monitoring-item-content">
      <div className="monitoring-item-top">
        <span className="monitoring-item-id">ID: {item.planId}</span>
        <span className="monitoring-item-field">{item.fieldName} - {item.fieldExtent} Ha</span>
        <span className="monitoring-item-time">
          {formatMonitoringDateTime(item.startTime || item.conditionCheckTime || '')}
        </span>
      </div>
      {item.waypointArea > 0 && (
        <div className="monitoring-waypoint">
          <FaMapMarked className="monitoring-waypoint-icon" />
          <span>Way-Point Extent - {item.waypointArea} Ha</span>
          {item.waypointMapUrl && (
            <a href={item.waypointMapUrl} target="_blank" rel="noopener noreferrer" className="monitoring-waypoint-view">
              View
            </a>
          )}
        </div>
      )}
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">Pilot: {item.pilotName}</span>
        <span className="monitoring-item-detail">Drone: {item.droneName || item.droneId}</span>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail"><strong>Pre-flight:</strong> {item.preCheckDone ? 'Done' : 'Pending'}</span>
        {item.startTime && (
          <span className="monitoring-item-detail">
            <strong>Start:</strong> {formatMonitoringDateTime(item.startTime)}
          </span>
        )}
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">
          <strong>Water:</strong> {item.waterReceived ? (item.waterTime ? formatMonitoringDateTime(item.waterTime) : 'Yes') : 'No'}
        </span>
        <span className="monitoring-item-detail">
          <strong>Chemical:</strong> {item.chemicalReceived ? (item.chemicalTime ? formatMonitoringDateTime(item.chemicalTime) : 'Yes') : 'No'}
        </span>
      </div>
      {item.startTime && (getElapsedTime || getCountdownRemaining) && (
        <MissionTimer
          startTime={item.startTime}
          waypointArea={item.waypointArea}
          getElapsedTime={getElapsedTime}
          getCountdownRemaining={getCountdownRemaining}
        />
      )}
    </div>
  </div>
);

const DroneUnlockItem = ({ item }) => (
  <div className="monitoring-item">
    <div className={`monitoring-item-icon ${item.droneUnlocked ? 'green' : 'amber'}`}>
      {item.droneUnlocked ? <FaCheckCircle /> : <FaBell />}
    </div>
    <div className="monitoring-item-content">
      <div className="monitoring-item-top">
        <span className="monitoring-item-id">ID: {item.planId}</span>
        <span className="monitoring-item-field">{item.estateName} - {item.totalExtent} Ha</span>
        <span className="monitoring-item-time">{item.time}</span>
      </div>
      <div className="monitoring-item-details">
        {item.pilotName && <span className="monitoring-item-detail">Pilot: {item.pilotName}</span>}
        {item.droneName && <span className="monitoring-item-detail">Drone: {item.droneName}</span>}
      </div>
      <div className="monitoring-item-details">
        <span className={`monitoring-tag ${item.droneUnlocked ? 'green' : 'orange'}`}>
          {item.droneUnlocked ? 'Unlocked' : 'Ready to Unlock'}
        </span>
        {item.type === 'mission' && <span className="monitoring-tag blue">Mission</span>}
      </div>
      {item.fieldDetails && (
        <div className="monitoring-division-details">
          {item.fieldDetails.split(', ').map((fd, i) => (
            <span key={i} className="monitoring-division-chip">{fd}</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const PilotCompleteItem = ({ item }) => (
  <div className="monitoring-item">
    <div className={`monitoring-item-icon ${item.isPartial ? 'amber' : 'green'}`}><FaFlag /></div>
    <div className="monitoring-item-content">
      <div className="monitoring-item-top">
        <span className="monitoring-item-id">ID: {item.planId}</span>
        <span className="monitoring-item-field">{item.fieldName} - {item.fieldExtent} Ha</span>
        <span className="monitoring-item-time">{item.time}</span>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">Drone: {item.droneName || item.droneId}</span>
        <span className="monitoring-item-detail">Pilot: {item.pilotName}</span>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">Covered Extent: {item.coveredExtent} Ha</span>
        {item.isPartial && <span className="monitoring-item-detail">Remaining Extent: {item.remainingExtent} Ha</span>}
      </div>
      {item.isPartial && item.remainingOptionDesc && (
        <span className="monitoring-tag orange">Partial Complete: {item.remainingOptionDesc}</span>
      )}
    </div>
  </div>
);

const COMOperatorAssignItem = ({ item }) => (
  <div className="monitoring-item">
    <div className="monitoring-item-icon purple"><FaUserCog /></div>
    <div className="monitoring-item-content">
      <div className="monitoring-item-top">
        <span className="monitoring-item-id">ID: {item.planId}</span>
        <span className="monitoring-item-field">{item.estateName}</span>
        <span className="monitoring-item-time">{item.time}</span>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">
          Operator: {item.operatorName}
          {item.operatorPhone && (
            <><span className="detail-separator">|</span>{item.operatorPhone}</>
          )}
        </span>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">Total Extent: {item.totalExtent} Ha</span>
      </div>
      {/* Fields intentionally omitted for COM Operator Assign items */}
    </div>
  </div>
);

const PilotCancelItem = ({ item }) => (
  <div className="monitoring-item">
    <div className="monitoring-item-icon red"><FaTimesCircle /></div>
    <div className="monitoring-item-content">
      <div className="monitoring-item-top">
        <span className="monitoring-item-id">ID: {item.planId}</span>
        <span className="monitoring-item-field">{item.fieldName} - {item.fieldExtent} Ha</span>
        <span className="monitoring-item-time">{item.time}</span>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">Pilot: {item.pilotName}</span>
        <span className="monitoring-item-detail">Drone: {item.droneName || item.droneId}</span>
      </div>
      {item.cancelReason && <span className="monitoring-tag red">{item.cancelReason}</span>}
    </div>
  </div>
);

const formatMonitoringDateTime = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  const pad = (n) => String(n).padStart(2, '0');

  // If backend sends ISO/UTC (e.g. 2026-02-24T09:52:19.000Z), convert to SL time.
  if (/[T].*(Z|[+-]\d{2}:\d{2})$/.test(str)) {
    const date = new Date(str);
    if (!Number.isNaN(date.getTime())) {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Colombo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).formatToParts(date);

      const getPart = (type) => parts.find((p) => p.type === type)?.value || '';
      return `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
    }
  }

  // Already in local DB style (YYYY-MM-DD HH:mm:ss or with milliseconds)
  const plainMatch = str.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/);
  if (plainMatch) return `${plainMatch[1]} ${plainMatch[2]}`;

  // Time-only fallback
  const timeOnly = str.match(/^(\d{2}):(\d{2}):(\d{2})/);
  if (timeOnly) return `${pad(timeOnly[1])}:${pad(timeOnly[2])}:${pad(timeOnly[3])}`;

  return str;
};

const WaterChemicalItem = ({ item }) => (
  <div className="monitoring-item">
    <div className="monitoring-item-icon teal"><FaTint /></div>
    <div className="monitoring-item-content">
      <div className="monitoring-item-top">
        <span className="monitoring-item-id">ID: {item.planId}</span>
        <span className="monitoring-item-field">
          {item.fieldName} - {item.fieldExtent} Ha
          {item.isFirstField ? ' (First field of the plan)' : ''}
        </span>
      </div>
      <div className="monitoring-item-details">
        {item.waterTime && (
          <span className="monitoring-item-detail">
            Water Time: {formatMonitoringDateTime(item.waterTime)}
          </span>
        )}
        <span className="monitoring-item-detail">
          Pilot: {item.pilotName}
          {item.pilotPhone ? (<><span className="detail-separator">|</span>{item.pilotPhone}</>) : null}
        </span>
      </div>
      <div className="monitoring-item-details">
        {item.chemicalTime && (
          <span className="monitoring-item-detail">
            Chemical Time: {formatMonitoringDateTime(item.chemicalTime)}
          </span>
        )}
        <span className="monitoring-item-detail">Drone: {item.droneName || item.droneId}</span>
      </div>
    </div>
  </div>
);

const DjiUploadItem = ({ item }) => (
  <div className="monitoring-item">
    <div className="monitoring-item-icon lightblue"><FaImage /></div>
    <div className="monitoring-item-content">
      <div className="monitoring-item-top">
        <span className="monitoring-item-id">Image Uploaded</span>
        <span className="monitoring-item-time">{item.time}</span>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">Field: {item.fieldName || item.estateName || 'N/A'}</span>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">
          By : {item.uploaderName}
          {item.uploaderPhone && (<><span className="detail-separator">|</span>{item.uploaderPhone}</>)}
        </span>
      </div>
    </div>
  </div>
);

const DayEndItem = ({ item }) => (
  <div className="monitoring-item">
    <div className="monitoring-item-icon pink"><FaStar /></div>
    <div className="monitoring-item-content">
      <div className="monitoring-item-top">
        <span className="monitoring-item-id">ID: {item.planId}</span>
        <span className="monitoring-item-field">{item.estateName}</span>
        <span className="monitoring-item-time">{item.time || '—'}</span>
      </div>
      <div className="monitoring-item-details">
        <span className="monitoring-item-detail">
          By: {item.completedByName}
          {item.completedByPhone && (<><span className="detail-separator"> | </span>{item.completedByPhone}</>)}
        </span>
      </div>
      {item.fields && item.fields.length > 0 && (
        <div className="monitoring-division-details">
          {item.fields.map((f, i) => (
            <span
              key={f.fieldId || i}
              className={`monitoring-division-chip ${f.completed ? 'approved' : 'not-approved'}`}
              title={f.completed ? `Completed${f.completedAt ? ` at ${f.completedAt}` : ''}` : 'Not completed'}
            >
              {f.fieldName} – {f.fieldArea.toFixed(2)} Ha {f.completed ? '✓' : '—'}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

/**
 * Plan Request card content - shows ad-hoc and reschedule counts
 * Similar to Queue section in WorkflowDashboard
 */
const PlanRequestCard = ({ adhocCount, rescheduleCount, navigate }) => (
  <div className="monitoring-plan-request-card">
    <div
      className="monitoring-plan-request-row adhoc"
      onClick={() => navigate('/home/requestsQueue')}
    >
      <div className="monitoring-plan-request-left">
        <FaMapMarkerAlt className="monitoring-plan-request-icon" />
        <span className="monitoring-plan-request-label">Ad-hoc Plans</span>
      </div>
      <span className="monitoring-plan-request-count">Plans {adhocCount} &raquo;</span>
    </div>
    <div
      className="monitoring-plan-request-row reschedule"
      onClick={() => navigate('/home/requestsQueue')}
    >
      <div className="monitoring-plan-request-left">
        <FaExclamationTriangle className="monitoring-plan-request-icon" />
        <span className="monitoring-plan-request-label">Reschedule Request Plans</span>
      </div>
      <span className="monitoring-plan-request-count">Plans {rescheduleCount} &raquo;</span>
    </div>
  </div>
);

/* =====================================================
   EXPANDED CARD MODAL
   ===================================================== */

const itemRenderers = {
  managerApprovals: (item, idx, props) => <ManagerApprovalItem key={`exp-ma-${idx}`} item={item} />,
  pilotStartMissions: (item, idx, props) => (
    <PilotStartItem key={`exp-psm-${idx}`} item={item} getElapsedTime={props.getElapsedTime} getCountdownRemaining={props.getCountdownRemaining} />
  ),
  droneUnlockRequests: (item, idx) => <DroneUnlockItem key={`exp-dur-${idx}`} item={item} />,
  pilotCompleteMissions: (item, idx) => <PilotCompleteItem key={`exp-pcm-${idx}`} item={item} />,
  comOperatorAssign: (item, idx) => <COMOperatorAssignItem key={`exp-coa-${idx}`} item={item} />,
  pilotCancelMissions: (item, idx) => <PilotCancelItem key={`exp-pcnl-${idx}`} item={item} />,
  waterChemicalTimes: (item, idx) => <WaterChemicalItem key={`exp-wct-${idx}`} item={item} />,
  djiMapUploads: (item, idx) => <DjiUploadItem key={`exp-dji-${idx}`} item={item} />,
  dayEndCompleted: (item, idx) => <DayEndItem key={`exp-dec-${idx}`} item={item} />,
};

const ExpandedCardModal = ({ section, cardKey, onClose, getElapsedTime, getCountdownRemaining, navigate, adhocCount, rescheduleCount, adhocRequests, rescheduleRequests }) => {
  // Special handling for Plan Requests expanded view
  if (cardKey === 'planRequests') {
    return (
      <div className="monitoring-modal-overlay" onClick={onClose}>
        <div className="monitoring-modal" onClick={(e) => e.stopPropagation()}>
          <div className={`monitoring-modal-header ${section.headerColor}`}>
            <div className="monitoring-modal-header-left">
              <span className="monitoring-modal-title">{section.title}</span>
              <span className="monitoring-card-count">{adhocCount + rescheduleCount}</span>
            </div>
            <button className="monitoring-modal-close" onClick={onClose} title="Close">
              <FaTimes />
            </button>
          </div>
          <div className="monitoring-modal-body">
            {/* Ad-hoc Section */}
            <div className="monitoring-plan-expanded-section">
              <div className="monitoring-plan-expanded-header adhoc">
                <FaMapMarkerAlt />
                <span>Ad-hoc Plans</span>
                <span className="monitoring-plan-expanded-count">{adhocCount}</span>
              </div>
              {adhocRequests.length === 0 ? (
                <div className="monitoring-empty">No pending ad-hoc requests</div>
              ) : (
                adhocRequests.map((req, idx) => (
                  <div key={`exp-adhoc-${idx}`} className="monitoring-item">
                    <div className="monitoring-item-icon red"><FaMapMarkerAlt /></div>
                    <div className="monitoring-item-content">
                      <div className="monitoring-item-top">
                        <span className="monitoring-item-id">
                          {req.estate_name || req.estate || 'Ad-hoc Request'}
                        </span>
                        <span className="monitoring-item-time">{req.date_planed || req.created_at || ''}</span>
                      </div>
                      {(req.total_extent || req.totalExtent) && (
                        <div className="monitoring-item-details">
                          <span className="monitoring-item-detail">
                            Extent: {req.total_extent || req.totalExtent} Ha
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reschedule Section */}
            <div className="monitoring-plan-expanded-section">
              <div className="monitoring-plan-expanded-header reschedule">
                <FaExclamationTriangle />
                <span>Reschedule Request Plans</span>
                <span className="monitoring-plan-expanded-count">{rescheduleCount}</span>
              </div>
              {rescheduleRequests.length === 0 ? (
                <div className="monitoring-empty">No pending reschedule requests</div>
              ) : (
                rescheduleRequests.map((req, idx) => (
                  <div key={`exp-resc-${idx}`} className="monitoring-item">
                    <div className="monitoring-item-icon amber"><FaExclamationTriangle /></div>
                    <div className="monitoring-item-content">
                      <div className="monitoring-item-top">
                        <span className="monitoring-item-id">
                          {req.estate_name || req.estate || 'Reschedule Request'}
                        </span>
                        <span className="monitoring-item-time">{req.request_date || req.created_at || ''}</span>
                      </div>
                      {(req.total_extent || req.totalExtent) && (
                        <div className="monitoring-item-details">
                          <span className="monitoring-item-detail">
                            Extent: {req.total_extent || req.totalExtent} Ha
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderer = itemRenderers[cardKey];
  if (!renderer) return null;

  return (
    <div className="monitoring-modal-overlay" onClick={onClose}>
      <div className="monitoring-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`monitoring-modal-header ${section.headerColor}`}>
          <div className="monitoring-modal-header-left">
            <span className="monitoring-modal-title">{section.title}</span>
            <span className="monitoring-card-count">{section.data.length}</span>
          </div>
          <button className="monitoring-modal-close" onClick={onClose} title="Close">
            <FaTimes />
          </button>
        </div>
        <div className="monitoring-modal-body">
          {section.data.length === 0 ? (
            <div className="monitoring-empty">No items</div>
          ) : (
            section.data.map((item, idx) => renderer(item, idx, { getElapsedTime, getCountdownRemaining }))
          )}
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   REUSABLE SUB-COMPONENTS
   ===================================================== */

const DashboardCard = ({ title, count, headerColor, onExpand, children }) => (
  <div className="monitoring-card">
    <div className={`monitoring-card-header ${headerColor}`}>
      <div className="monitoring-card-header-left">
        <span>{title}</span>
        <span className="monitoring-card-count">{count}</span>
      </div>
      <button className="monitoring-card-expand" onClick={onExpand} title="Expand to detailed view">
        <FaExpand />
      </button>
    </div>
    <div className="monitoring-card-body">
      {children}
    </div>
  </div>
);

const MissionTimer = ({ startTime, waypointArea, getElapsedTime, getCountdownRemaining }) => {
  // 1 Ha = 30 min: count down from (waypointArea * 30) min to 0
  if (waypointArea > 0 && getCountdownRemaining) {
    const remaining = getCountdownRemaining(startTime, waypointArea);
    if (!remaining) return null;
    return (
      <div className="monitoring-countdown">
        <FaClock className="monitoring-countdown-icon" />
        <span>{remaining.display}</span>
        <span className="monitoring-countdown-label">remaining</span>
      </div>
    );
  }
  const elapsed = getElapsedTime?.(startTime);
  if (!elapsed) return null;
  return (
    <div className="monitoring-countdown">
      <FaClock className="monitoring-countdown-icon" />
      <span>{elapsed.display}</span>
      <span className="monitoring-countdown-label">elapsed</span>
    </div>
  );
};

export default MonitoringDashboard;
