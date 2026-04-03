import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaPlayCircle,
  FaTint,
  FaImage,
  FaMapMarked,
  FaUserCog,
  FaFlag,
  FaCalendarAlt,
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import {
  useGetFieldHistoryEstatesQuery,
  useGetFieldHistoryFieldsByEstateQuery,
  useGetFieldHistoryDataQuery,
} from '../../../api/services NodeJs/fieldHistoryApi';
import '../../../styles/fieldhistory.css';

const getFlagText = (flag) => {
  const flags = { np: 'Revolving Plan', ap: 'Adhoc Plan', rp: 'Reschedule Plan' };
  return flags[flag] || flag;
};

const getTypeText = (type) => {
  const types = { spy: 'Spray', spd: 'Spread' };
  return types[type] || type;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const buildMonthOptions = () => {
  const opts = [{ value: 'all', label: 'All (Overall)' }];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    opts.push({ value: ym, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` });
  }
  return opts;
};

const FieldHistory = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [selectedEstate, setSelectedEstate] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState([]); // multi-select: [] or ['all'] or ['2026-03','2026-02']
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const monthOptions = useMemo(() => buildMonthOptions(), []);

  // Estates
  const { data: estatesResp } = useGetFieldHistoryEstatesQuery();
  const estates = estatesResp?.data || [];

  // Fields (when estate selected)
  const { data: fieldsResp } = useGetFieldHistoryFieldsByEstateQuery(selectedEstate?.value, {
    skip: !selectedEstate?.value,
  });
  const fields = fieldsResp?.data || [];

  // Resolve months for API: [] or ['all'] = no filter; else array of "YYYY-MM"
  const monthsForApi = useMemo(() => {
    if (!selectedMonths?.length) return [];
    if (selectedMonths.some((m) => m.value === 'all')) return [];
    return selectedMonths.map((m) => m.value);
  }, [selectedMonths]);

  // Field history data (months: [] = all, or specific YYYY-MM values)
  const { data: historyResp, isLoading, isError, refetch } = useGetFieldHistoryDataQuery(
    { fieldId: selectedField?.value, months: monthsForApi },
    { skip: !selectedField?.value }
  );

  const historyData = historyResp?.data || {};
  const history = historyData.history || [];
  const spreadSpray = historyData.spreadSpray || null;

  const estateOptions = useMemo(
    () =>
      estates.map((e) => ({
        value: Number(e.id),
        label: e.estate || e.estate_name || `Estate ${e.id}`,
      })),
    [estates]
  );

  const fieldOptions = useMemo(
    () =>
      fields.map((f) => ({
        value: Number(f.id),
        label: `${f.field || f.field_name || `Field ${f.id}`}${f.division_name ? ` (${f.division_name})` : ''}`,
      })),
    [fields]
  );

  const handleEstateChange = (opt) => {
    setSelectedEstate(opt);
    setSelectedField(null);
    setExpandedPlan(null);
  };

  const handleFieldChange = (opt) => {
    setSelectedField(opt);
    setExpandedPlan(null);
  };

  const handleMonthChange = (opts) => {
    if (!opts) opts = [];
    const arr = Array.isArray(opts) ? opts : [opts].filter(Boolean);
    const hasAll = arr.some((o) => o?.value === 'all');
    if (hasAll && arr.length > 1) {
      setSelectedMonths(arr.filter((o) => o?.value !== 'all'));
    } else if (hasAll) {
      setSelectedMonths([{ value: 'all', label: 'All (Overall)' }]);
    } else {
      setSelectedMonths(arr);
    }
  };

  const togglePlan = (planId) => {
    setExpandedPlan((p) => (p === planId ? null : planId));
  };

  return (
    <div className="field-history-container-fieldhistory">
      {/* Header */}
      <div className="field-history-header-fieldhistory">
        <button
          className="field-history-back-btn-fieldhistory"
          onClick={() => navigate({ pathname: '/home/workflowDashboard', search: routerLocation.search })}
          title="Back to Dashboard"
        >
          <FaArrowLeft />
        </button>
        <div className="field-history-header-content-fieldhistory">
          <h1>Field History</h1>
          <p>View clear history for fields: Manager Approval, Pilot Mission, COM Operator, Water & Chemical, DJI Upload, Day End</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="field-history-content-fieldhistory">
        {/* Selection: Estate, Field, Month - same row */}
        <div className="field-history-selection-fieldhistory field-history-selection-row-fieldhistory">
          <div className="field-history-select-group-fieldhistory">
            <label className="field-history-label-fieldhistory">
              <FaMapMarked /> Estate
            </label>
            <Select
              value={selectedEstate}
              onChange={handleEstateChange}
              options={estateOptions}
              isSearchable
              placeholder="Select estate..."
              className="field-history-select-fieldhistory"
              classNamePrefix="field-history-select"
              isDisabled={!estateOptions.length}
            />
          </div>
          <div className="field-history-select-group-fieldhistory">
            <label className="field-history-label-fieldhistory">
              <FaFlag /> Field
            </label>
            <Select
              value={selectedField}
              onChange={handleFieldChange}
              options={fieldOptions}
              isSearchable
              placeholder="Select field..."
              className="field-history-select-fieldhistory"
              classNamePrefix="field-history-select"
              isDisabled={!selectedEstate}
            />
          </div>
          <div className="field-history-select-group-fieldhistory">
            <label className="field-history-label-fieldhistory">
              <FaCalendarAlt /> Month
            </label>
            <Select
              value={selectedMonths}
              onChange={handleMonthChange}
              options={monthOptions}
              isMulti
              isSearchable
              placeholder="All (Overall) or select months..."
              className="field-history-select-fieldhistory"
              classNamePrefix="field-history-select"
              isClearable
              closeMenuOnSelect={false}
            />
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="field-history-loading-fieldhistory">
            <div className="field-history-spinner" />
            <p>Loading field history...</p>
          </div>
        )}
        {isError && (
          <div className="field-history-error-fieldhistory">
            <span>Failed to load field history</span>
            <button className="field-history-retry-btn" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {/* History List */}
        {!isLoading && !isError && selectedField && (
          <div className="field-history-plans-fieldhistory">
            {history.length === 0 ? (
              <div className="field-history-empty-fieldhistory">
                <FaImage />
                <h3>No Data Found</h3>
                <p>No history available for this field in the selected date range</p>
              </div>
            ) : (
              <>
                {spreadSpray && (
                  <div className="field-history-spread-spray-fieldhistory">
                    <span className="field-history-spread-spray-label-fieldhistory">Spread</span>
                    <span className={`fh-yn-badge-fieldhistory ${spreadSpray.canSpread ? 'fh-yn-yes-fieldhistory' : 'fh-yn-no-fieldhistory'}`}>
                      {spreadSpray.canSpread ? 'Yes' : 'No'}
                    </span>
                    {!spreadSpray.canSpread && (
                      <span className="fh-yn-reason-fieldhistory">
                        Reason: {spreadSpray.spreadReason || 'Not specified'}
                      </span>
                    )}
                    <span className="field-history-spread-spray-sep-fieldhistory">|</span>
                    <span className="field-history-spread-spray-label-fieldhistory">Spray</span>
                    <span className={`fh-yn-badge-fieldhistory ${spreadSpray.canSpray ? 'fh-yn-yes-fieldhistory' : 'fh-yn-no-fieldhistory'}`}>
                      {spreadSpray.canSpray ? 'Yes' : 'No'}
                    </span>
                    {!spreadSpray.canSpray && (
                      <span className="fh-yn-reason-fieldhistory">
                        Reason: {spreadSpray.sprayReason || 'Not specified'}
                      </span>
                    )}
                  </div>
                )}
              <div className="field-history-plans-list-fieldhistory">
                {history.map((record) => (
                  <div key={`${record.planId}-${record.date}`} className="field-history-plan-fieldhistory">
                    <div
                      className="field-history-plan-header-fieldhistory"
                      onClick={() => togglePlan(record.planId)}
                    >
                      <div className="field-history-plan-info-fieldhistory">
                        <div className="field-history-plan-id-fieldhistory">
                          Plan #{record.planId}
                          {record.fieldId != null && ` · Field #${record.fieldId}`}
                          {record.taskIds?.length > 0 && (
                            <> · Task #{record.taskIds.length === 1 ? record.taskIds[0] : record.taskIds.join(', #')}</>
                          )}
                        </div>
                        <div className="field-history-plan-title-fieldhistory">
                          {record.fieldName || record.estateName} - {record.fieldArea} Ha
                        </div>
                        <div className="field-history-plan-meta-fieldhistory">
                          <span className="field-history-plan-date-fieldhistory">
                            <FaCalendarAlt /> {record.date}
                          </span>
                          <span className={`field-history-plan-badge-fieldhistory field-history-plan-badge-${record.flag}-fieldhistory`}>
                            {getFlagText(record.flag)}
                          </span>
                          <span className={`field-history-plan-badge-fieldhistory field-history-plan-badge-${record.type}-fieldhistory`}>
                            {getTypeText(record.type)}
                          </span>
                        </div>
                      </div>
                      <div className="field-history-plan-right-fieldhistory">
                        <div className="field-history-plan-assigned-fieldhistory">
                          {record.assignedPilotName || record.assignedDroneTag ? (
                            <>
                              <span>Pilot: {record.assignedPilotName || '–'}</span>
                              <span className="field-history-plan-assigned-sep-fieldhistory">|</span>
                              <span>Drone: {record.assignedDroneTag || '–'}</span>
                            </>
                          ) : (
                            <span className="fh-muted">Not assigned</span>
                          )}
                        </div>
                        <div className="field-history-plan-toggle-fieldhistory">
                          {expandedPlan === record.planId ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>
                    </div>

                    {expandedPlan === record.planId && (
                      <div className="field-history-plan-details-fieldhistory">
                        {/* Manager Approval */}
                        <div className="field-history-detail-section-fieldhistory">
                          <h3>
                            <FaCheckCircle className="fh-green" /> Manager Approval
                          </h3>
                          <div className="field-history-detail-body-fieldhistory">
                            {record.managerApproval.rejected ? (
                              <div className="field-history-rejection-fieldhistory">
                                <span className="fh-badge fh-badge-red">Rejected</span>
                                {record.managerApproval.rejectReason && <p>{record.managerApproval.rejectReason}</p>}
                              </div>
                            ) : record.managerApproval.approved ? (
                              <>
                                <span className="fh-badge fh-badge-green">Approved</span>
                                {record.managerApproval.time && <span className="fh-time">{record.managerApproval.time}</span>}
                                {record.managerApproval.managerName && <span> by {record.managerApproval.managerName}</span>}
                              </>
                            ) : (
                              <span className="fh-muted">Pending</span>
                            )}
                          </div>
                        </div>

                        {/* Pilot Start Mission */}
                        <div className="field-history-detail-section-fieldhistory">
                          <h3>
                            <FaPlayCircle className="fh-blue" /> Pilot - Start Mission
                          </h3>
                          <div className="field-history-detail-body-fieldhistory">
                            {record.pilotStartMission ? (
                              <span>
                                Pilot: {record.pilotStartMission.pilotName} | Drone: {record.pilotStartMission.droneName}
                                {record.pilotStartMission.startTime && ` | Start: ${record.pilotStartMission.startTime}`}
                              </span>
                            ) : (
                              <span className="fh-muted">Not started</span>
                            )}
                          </div>
                        </div>

                        {/* Pilot Complete / Partial / Cancel */}
                        <div className="field-history-detail-section-fieldhistory">
                          <h3>
                            <FaCheckCircle className="fh-green" /> Pilot Complete / Partial / Cancel
                          </h3>
                          <div className="field-history-detail-body-fieldhistory">
                            {record.pilotComplete?.length > 0 && (
                              <div className="field-history-items">
                                {record.pilotComplete.map((t) => (
                                  <div key={t.taskId} className="field-history-item">
                                    <span className="fh-badge fh-badge-green">{t.isPartial ? 'Partial' : 'Complete'}</span>
                                    {t.pilotName} | {t.droneName} | Covered: {t.coveredExtent} Ha
                                    {t.remainingOptionDesc && ` | ${t.remainingOptionDesc}`}
                                    {t.time && <span className="fh-time"> {t.time}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                            {record.pilotCancel?.length > 0 && (
                              <div className="field-history-items">
                                {record.pilotCancel.map((t) => (
                                  <div key={t.taskId} className="field-history-item">
                                    <span className="fh-badge fh-badge-red">Cancel</span>
                                    {t.pilotName} | {t.cancelReason}
                                    {t.time && <span className="fh-time"> {t.time}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                            {record.pilotComplete?.length === 0 && record.pilotCancel?.length === 0 && (
                              <span className="fh-muted">No completion/cancel record</span>
                            )}
                          </div>
                        </div>

                        {/* COM Operator Assign */}
                        <div className="field-history-detail-section-fieldhistory">
                          <h3>
                            <FaUserCog className="fh-purple" /> COM Operator Assign
                          </h3>
                          <div className="field-history-detail-body-fieldhistory">
                            {record.comOperatorAssign ? (
                              <>
                                {record.comOperatorAssign.operatorName}
                                {record.comOperatorAssign.operatorPhone && ` | ${record.comOperatorAssign.operatorPhone}`}
                                {record.comOperatorAssign.time && <span className="fh-time"> {record.comOperatorAssign.time}</span>}
                              </>
                            ) : (
                              <span className="fh-muted">Not assigned</span>
                            )}
                          </div>
                        </div>

                        {/* Water & Chemical Times */}
                        <div className="field-history-detail-section-fieldhistory">
                          <h3>
                            <FaTint className="fh-teal" /> Pilot - Water & Chemical Times
                          </h3>
                          <div className="field-history-detail-body-fieldhistory">
                            {record.waterChemicalTimes?.length > 0 ? (
                              <div className="field-history-items">
                                {record.waterChemicalTimes.map((t) => (
                                  <div key={t.taskId} className="field-history-item">
                                    Water: {t.waterTime || '-'} | Chemical: {t.chemicalTime || '-'}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="fh-muted">No data</span>
                            )}
                          </div>
                        </div>

                        {/* DJI Map Upload */}
                        <div className="field-history-detail-section-fieldhistory">
                          <h3>
                            <FaMapMarked className="fh-lightblue" /> DJI Map Upload
                          </h3>
                          <div className="field-history-detail-body-fieldhistory">
                            {record.djiMapUploads?.length > 0 ? (
                              <div className="field-history-dji-uploads">
                                {record.djiMapUploads.map((u) => (
                                  <div key={u.imageId} className="field-history-dji-item">
                                    {u.autoGeneratedId} | {u.uploadDate}
                                    {u.imageUrl && (
                                      <a href={u.imageUrl} target="_blank" rel="noopener noreferrer" className="fh-link">
                                        View
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="fh-muted">No uploads for this day</span>
                            )}
                          </div>
                        </div>

                        {/* Day End Complete */}
                        <div className="field-history-detail-section-fieldhistory">
                          <h3>
                            <FaCheckCircle className="fh-pink" /> Day End Complete
                          </h3>
                          <div className="field-history-detail-body-fieldhistory">
                            {record.dayEndComplete?.completed ? (
                              <div className="field-history-dayend-fieldhistory">
                                <span className="fh-badge fh-badge-green">Completed</span>
                                {record.dayEndComplete.djiFieldArea != null && (
                                  <span className="fh-dji-area-fieldhistory">DJI field area: {record.dayEndComplete.djiFieldArea}</span>
                                )}
                              </div>
                            ) : (
                              <span className="fh-muted">Not completed</span>
                            )}
                          </div>
                        </div>

                        {/* Images - spans full width */}
                        {record.images?.some((i) => i.djiImageUrl || i.waypointImageUrl || i.pilotImageUrl) && (
                          <div className="field-history-detail-section-fieldhistory field-history-detail-section-full-fieldhistory">
                            <h3>
                              <FaImage /> Images
                            </h3>
                            <div className="field-history-images-fieldhistory">
                              {record.images.map((img) => (
                                <React.Fragment key={img.taskId}>
                                  {img.djiImageUrl && (
                                    <div className="field-history-image-wrap">
                                      <span className="fh-img-label">DJI (Task #{img.taskId})</span>
                                      <img
                                        src={img.djiImageUrl}
                                        alt="DJI"
                                        className="field-history-image-thumbnail-fieldhistory"
                                        onClick={() => setSelectedImage(img.djiImageUrl)}
                                      />
                                    </div>
                                  )}
                                  {img.waypointImageUrl && (
                                    <div className="field-history-image-wrap">
                                      <span className="fh-img-label">Waypoint (Task #{img.taskId})</span>
                                      <img
                                        src={img.waypointImageUrl}
                                        alt="Waypoint"
                                        className="field-history-image-thumbnail-fieldhistory"
                                        onClick={() => setSelectedImage(img.waypointImageUrl)}
                                      />
                                    </div>
                                  )}
                                  {img.pilotImageUrl && (
                                    <div className="field-history-image-wrap">
                                      <span className="fh-img-label">Pilot (Task #{img.taskId})</span>
                                      <img
                                        src={img.pilotImageUrl}
                                        alt="Pilot"
                                        className="field-history-image-thumbnail-fieldhistory"
                                        onClick={() => setSelectedImage(img.pilotImageUrl)}
                                      />
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        )}

        {!selectedField && (
          <div className="field-history-empty-fieldhistory">
            <FaFlag />
            <h3>Select Estate & Field</h3>
            <p>Choose an estate and field to view history</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="field-history-modal-fieldhistory" onClick={() => setSelectedImage(null)}>
          <div className="field-history-modal-content-fieldhistory" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full view" className="field-history-modal-image-fieldhistory" />
            <button className="field-history-modal-close-fieldhistory" onClick={() => setSelectedImage(null)}>
              <FaTimesCircle />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldHistory;
