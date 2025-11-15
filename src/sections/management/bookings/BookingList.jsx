import React, { useState, useEffect, useCallback } from 'react';
import '../../../styles/bookinglist.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bars } from 'react-loader-spinner';
import {
  FaCalendarAlt,
  FaFilter,
  FaEdit,
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaIdCard,
  FaLeaf,
  FaIndustry,
  FaWater,
  FaBuilding,
  FaUserTie,
  FaExpandAlt,
  FaDownload
} from 'react-icons/fa';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchBookingDropdownData,
  fetchBookingsByDateRange,
  selectSectors,
  selectCrops,
  selectMissions,
  selectTimePicks,
  selectAscs,
  selectBrokersDropdown,
  selectBookingLoading,
} from '../../../store/slices/bookingsSlice';
import BookingModal from './BookingModal';
import * as XLSX from 'xlsx';

const BookingList = () => {
  const dispatch = useAppDispatch();
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [dateSetupPopup, setDateSetupPopup] = useState({ open: false, missionId: null, date: null, payment: '' });
  const [editableData, setEditableData] = useState({});
  const [editMode, setEditMode] = useState(null);
  const [chemicalOptions, setChemicalOptions] = useState([]);
  const [leaderLoading] = useState(false);
  const [selectedLeaderFilter, setSelectedLeaderFilter] = useState('all');
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [selectedAscFilter, setSelectedAscFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [showPickedOnly, setShowPickedOnly] = useState(false);
  const [defaultQueueView, setDefaultQueueView] = useState(true);
  const [ascGndPopupOpen, setAscGndPopupOpen] = useState(false);
  const [ascGndSelection, setAscGndSelection] = useState({ missionId: null, ascId: '', gndId: '', gndOptions: [] });
  const [isAssigningAscGnd, setIsAssigningAscGnd] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('details');
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Get from Redux
  const sectorOptions = useAppSelector(selectSectors);
  const cropOptions = useAppSelector(selectCrops);
  const missionOptions = useAppSelector(selectMissions);
  const timeOptions = useAppSelector(selectTimePicks);
  const ascOptions = useAppSelector(selectAscs);
  const brokerOptions = useAppSelector(selectBrokersDropdown);
  const loading = useAppSelector(selectBookingLoading);

  // Fetch dropdown data on mount
  useEffect(() => {
    if (sectorOptions.length === 0 && !loading.dropdownData) {
      dispatch(fetchBookingDropdownData());
    }
  }, [dispatch, sectorOptions.length, loading.dropdownData]);

  // Define handleSearch before any effects that reference it to avoid TDZ errors
  const handleSearch = useCallback(async () => {
    if (!startDate || !endDate) {
      return;
    }

    try {
      setError('');
      const formattedStartDate = startDate.toLocaleDateString('en-CA');
      const formattedEndDate = endDate.toLocaleDateString('en-CA');
      
      const result = await dispatch(fetchBookingsByDateRange({ startDate: formattedStartDate, endDate: formattedEndDate }));
      
      if (!fetchBookingsByDateRange.fulfilled.match(result)) {
        setError('Failed to fetch bookings');
        setBookings([]);
        return;
      }
      
      const response = result.payload;
      setBookings([]);
      
      if (response && response["0"]) {
        const transformedBookings = response["0"].map(mission => {
          const matchedAsc = ascOptions.find(asc => asc.id === mission.asc);

          return {
            missionId: mission.mission_id,
            date: mission.date_requested,
            statusText: mission.status_text,
            farmerName: mission.farmer_name,
            farmerAddress: mission.farmer_address,
            nic: mission.farmer_nic,
            mobile: mission.farmer_telephone,
            landName: mission.land_name,
            cropName: mission.crop_type_name,
            landExtent: `${mission.land_extent} Acres`,
            total_land_extent: mission.total_land_extent,
            register_no: mission.register_no,
            missionType: mission.mission_type.toUpperCase(),
            landAddress: mission.land_address,
            pickedDate: mission.date_planed,
            asc: mission.sector_name,
            sector_name: mission.sector_name,
            asc_id: mission.asc,
            asc_api_name: mission.asc_name,
            agrochemical: mission.chemical_name,
            neededUnits: mission.units,
            pickTime: mission.pick_time,
            pickTimeText: timeOptions.find(t => t.id === mission.pick_time)?.time_of_day || 'Not set',
            needed_water: mission.needed_water,
            status: mission.status,
            payments: mission.payments,
            asc_name: matchedAsc ? matchedAsc.name : null,
            asc_code: matchedAsc ? matchedAsc.code : null,
            broker_id: mission.broker_id || null,
            broker_name: mission.broker_name || null,
            broker_code: mission.broker_code || null,
            broker_mobile: mission.broker_mobile || null,
            chemical_provided: mission.chemical_provided,
            gnd_id: mission.gnd_id,
            gnd: mission.gnd,
            stage_name: mission.stage_name,
            team_assigned: mission.team_assigned,
            team: mission.team
          };
        });
        setBookings(transformedBookings);
      }
    } catch (err) {
      setError('Failed to fetch bookings');
      setBookings([]);
    }
  }, [startDate, endDate, ascOptions, timeOptions, dispatch]);

  // Auto-fetch bookings when component mounts and when dates change
  useEffect(() => {
    if (startDate && endDate) {
      handleSearch();
    }
  }, [startDate, endDate, handleSearch]);

  useEffect(() => {
    const fetchChemicals = async () => {
      if (editableData.mission_type) {
        try {
          const chemicalsResult = await dispatch(baseApi.endpoints.getChemicalTypes.initiate());
      const chemicalsRes = chemicalsResult.data;
          const chemicalsList = chemicalsRes?.[0] || [];

          const filteredChemicals = chemicalsList.filter(chemical =>
            chemical.category.toUpperCase() === editableData.mission_type.toUpperCase()
          );

          setChemicalOptions(filteredChemicals);

          const currentChemical = filteredChemicals.find(
            ch => ch.chemical === bookings.find(b => b.missionId === editMode)?.agrochemical
          );

          if (currentChemical) {
            setEditableData(prev => ({
              ...prev,
              chemical_id: currentChemical.id
            }));
          }
        } catch (error) {
          console.error('Error fetching chemicals:', error);
        }
      }
    };

    fetchChemicals();
  }, [editableData.mission_type, editMode, bookings]);

  const handleEditClick = (booking) => {
    const selectedSector = sectorOptions.find(s => s.sector === booking.asc);
    const selectedCrop = cropOptions.find(c => c.crop === booking.cropName);
    const selectedTime = timeOptions.find(t => t.id === Number(booking.pickTime));
    const selectedMission = missionOptions.find(
      m => m.mission_type_code.toUpperCase() === booking.missionType.toUpperCase()
    );
    const selectedChemical = chemicalOptions.find(ch => ch.chemical === booking.agrochemical);
    const initialChemical = chemicalOptions.find(
      ch => ch.chemical === booking.agrochemical
    );
    const editable = {
      crop_type: selectedCrop?.id || '',
      land_extent: booking.landExtent.replace(' Acres', ''),
      mission_type: selectedMission?.mission_type_code || '',
      sector_id: selectedSector?.id || '',
      chemical_id: initialChemical?.id || '',
      units: booking.neededUnits,
      selectedTime: selectedTime.id,
      land_address: booking.landAddress,
      needed_water: booking.needed_water,
      pick_time: selectedTime?.id || '',
      chemical_provided: booking.chemical_provided === 1,
      broker_id: booking.broker_id || '',
    };

    setEditableData(editable);
    setSelectedBooking(booking);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDetailsClick = (booking) => {
    setSelectedBooking(booking);
    setModalMode('details');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBooking(null);
    setModalMode('details');
    setEditableData({});
  };

  const handleUpdate = async (missionId) => {
    try {
      setUpdating(true);

      const currentMission = bookings.find(b => b.missionId === missionId);
      const landExtentVal = (editableData.land_extent ?? '').toString();
      const dataSet = {
        id: missionId.toString(),
        land_extent: landExtentVal,
        total_land_extent: (editableData.total_land_extent ?? landExtentVal).toString(),
        land_address: (editableData.land_address ?? '').toString(),
        register_no: (editableData.register_no ?? '').toString(),
        sector: (editableData.sector_id ?? '').toString(),
        crop_type: (editableData.crop_type ?? '').toString(),
        mission_type: (editableData.mission_type ?? '').toString(),
        chemical: (editableData.chemical_id ?? '').toString(),
        chemical_provided: editableData.chemical_provided ? "1" : "0",
        units: (editableData.units ?? '').toString(),
        needed_water: (editableData.needed_water ?? '').toString(),
        date_requested: (currentMission?.date ?? '').toString(),
        pick_time: (editableData.pick_time ?? '').toString(),
        asc: (currentMission?.asc_id ?? '').toString(),
        gnd: (currentMission?.gnd_id ?? '').toString(),
        broker: (editableData.broker_id ?? '').toString()
      };
      const updateResult = await dispatch(baseApi.endpoints.updateMission.initiate(dataSet));
      const response = updateResult.data;
      console.log(dataSet);
      if (response.status === "true") {
        await handleSearch();
        handleModalClose();
      }
    } catch (err) {
      setError('Failed to update mission details');
      console.error('Update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString('en-CA') : '';
  };

  // removed unused handleDateChange

  const handleConfirmPlannedDate = async (missionId) => {
    const dateToSend = dateSetupPopup.date ? dateSetupPopup.date.toLocaleDateString('en-CA') : '';
    const paymentType = dateSetupPopup.payment || '';
    if (!dateToSend || !paymentType) {
      setError('Please select date and payment type (Cash/Credit).');
      return;
    }
    try {
      setUpdating(true);
      const result = await dispatch(
        baseApi.endpoints.updateMissionPlannedDate.initiate({
          id: missionId,
          datePlaned: dateToSend,
          paymentType: paymentType
        })
      );
      const response = result.data;
      if (response && response.status === "true") {
        await handleSearch();
        setDateSetupPopup({ open: false, missionId: null, date: null, payment: '' });
      }
    } catch (err) {
      setError('Failed to confirm planned date');
    } finally {
      setUpdating(false);
    }
  };

  

  // removed unused handleAscSelect

  const openAscGndPopup = (booking) => {
    if (!booking) return;
    const currentAscInternalId = booking.asc_id || '';
    const ascObj = ascOptions.find(a => a.id === currentAscInternalId) || null;
    const ascSelectionValue = ascObj?.asc_id || '';
    const currentGndId = booking.gnd_id || '';
    setAscGndSelection({
      missionId: booking.missionId,
      ascId: ascSelectionValue || '',
      gndId: currentGndId || '',
      gndOptions: ascObj?.gnds || []
    });
    setAscGndPopupOpen(true);
  };

  const handleConfirmAscGnd = async () => {
    try {
      setIsAssigningAscGnd(true);
      setError('');
      const { missionId, ascId, gndId } = ascGndSelection;
      if (!missionId || !ascId) {
        setError('Please select an ASC');
        return;
      }
      const payload = { id: missionId.toString(), asc: ascId.toString(), gnd: (gndId ?? '').toString() };
      const result = await dispatch(baseApi.endpoints.setASCForMission.initiate(payload));
      const response = result.data;
      if (response?.status === "true") {
        const ascObj = ascOptions.find(a => String(a.asc_id) === String(ascId)) || null;
        const gndName = (ascObj?.gnds || []).find(g => String(g.id) === String(gndId))?.gnd || '';
        setBookings(prev => prev.map(b => b.missionId === missionId ? {
          ...b,
          asc_id: ascObj?.id || b.asc_id,
          asc_name: ascObj?.name || null,
          asc_code: ascObj?.code || null,
          gnd_id: gndId || '',
          gnd: gndName
        } : b));
        setAscGndPopupOpen(false);
      } else {
        setError(response?.message || 'Failed to assign ASC/GND');
      }
    } catch (e) {
      console.error('Error setting ASC/GND:', e);
      setError(e.response?.data?.message || 'Error assigning ASC/GND');
    } finally {
      setIsAssigningAscGnd(false);
    }
  };

  const filterBookings = (bookings) => {
    return bookings.filter(booking => {
      // Default queue view: show pending OR (confirmed AND no date set)
      const defaultQueueMatch = defaultQueueView ? 
        (booking.status === 'p' || (booking.status === 'a' && !booking.pickedDate)) : true;

      const ascFilter =
        selectedAscFilter === 'all' ||
        (selectedAscFilter === 'unassigned' && !booking.asc_name) ||
        booking.asc_name === selectedAscFilter;

      const statusFilterMatch = (() => {
        if (selectedStatusFilter === 'all') return true;
        if (selectedStatusFilter === 'approved') return booking.status === 'a';
        if (selectedStatusFilter === 'declined') return booking.status === 'd';
        if (selectedStatusFilter === 'pending') return booking.status === 'p';
        return true;
      })();

      const datePickedMatch = showPickedOnly ? !!booking.pickedDate : true;

      return defaultQueueMatch && ascFilter && statusFilterMatch && datePickedMatch;
    });
  };

  const handleStatusChange = async (missionId, newStatus) => {
    try {
      setStatusUpdating(missionId);
      const result = await dispatch(
        baseApi.endpoints.updateMissionStatus.initiate({ id: missionId, status: newStatus })
      );
      const response = result.data;

      if (response.status === "true") {
        await handleSearch();
      }
    } catch (error) {
      setError('Failed to update status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'a': return '#28a745';
      case 'd': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'a': return 'Confirmed';
      case 'd': return 'Declined';
      default: return 'Pending';
    }
  };

  const filteredBookings = filterBookings(bookings);

  const handleDownloadExcel = () => {
    try {
      const rows = filterBookings(bookings).map((b) => ({
        'Mission ID': b.missionId,
        'Requested Date': b.date || '',
        'Picked Date': b.pickedDate || '',
        'Status': getStatusText(b.status),
        'Status Text': b.statusText || '',
        'Farmer Name': b.farmerName || '',
        'Farmer Address': b.farmerAddress || '',
        'NIC': b.nic || '',
        'Mobile': b.mobile || '',
        'Land Name': b.landName || '',
        'Crop': b.cropName || '',
        'Mission': b.missionType || '',
        'Land Extent': b.landExtent || '',
        'Land Address': b.landAddress || '',
        'Total Land Extent': b.total_land_extent ?? '',
        'ASC Name': b.asc_name || b.asc || '',
        'ASC (API Name)': b.asc_api_name || '',
        'Sector Name': b.sector_name || '',
        'Needed Units': b.neededUnits || '',
        'Pick Time Text': b.pickTimeText || '',
        'Water (L)': b.needed_water || '',
        'Chemical': b.agrochemical || '',
        'Chemical Provided': b.chemical_provided === 1 ? 'Yes' : 'No',
        'Broker Name': b.broker_name || '',
        'Broker Code': b.broker_code || '',
        'Broker Mobile': b.broker_mobile || '',
        'GND': b.gnd || '',
        'Select Stage': b.stage_name ?? '',
        'Team Assigned': b.team_assigned === 1 ? 'Team Assigned' : (b.team_assigned === 0 ? 'Not Assigned' : ''),
        'Team': b.team ?? ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
      const fileName = `Bookings_${formatDate(startDate)}_${formatDate(endDate)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (e) {
      console.error('Failed to export Excel:', e);
    }
  };

  return (
    <div className="booking-list-container">
      {/* Modern Header Section */}
      <div className="booking-header-section">
        <div className="header-content">
          <div className="header-left">
            <h3 className="page-title">
              <FaCalendarAlt className="title-icon" />
              <span>Non Plantation Booking Management</span>
            </h3>
            <p className="page-subtitle">Manage and track agricultural service bookings</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{filteredBookings.length}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {filteredBookings.filter(b => b.status === 'a').length}
              </span>
              <span className="stat-label">Confirmed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {filteredBookings.filter(b => b.pickedDate).length}
              </span>
              <span className="stat-label">Scheduled</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {filteredBookings.filter(b => b.status === 'p' || (b.status === 'a' && !b.pickedDate)).length}
              </span>
              <span className="stat-label">Queue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Controls Section */}
      <div className="controls-section">
        <div className="controls-left">
          <div className="date-controls">
            <div className="date-picker-group">
              <label className="date-label">
                <FaCalendarAlt className="label-icon" />
                Date Range
              </label>
              <div className="date-inputs">
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  placeholderText="Start Date"
                  dateFormat="yyyy-MM-dd"
                  disabled={loading}
                  className="date-picker-input"
                />
                <span className="date-separator">to</span>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  placeholderText="End Date"
                  dateFormat="yyyy-MM-dd"
                  disabled={loading}
                  className="date-picker-input"
                />
              </div>
            </div>
          </div>
          
          <div className="view-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={defaultQueueView}
                onChange={(e) => setDefaultQueueView(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Queue View</span>
            </label>
          </div>
        </div>

        <div className="controls-right">
          <button
            className="action-btn download-btn"
            onClick={handleDownloadExcel}
            disabled={loading}
          >
            <FaDownload className="btn-icon" />
            Excel
          </button>
          <button
            className={`action-btn filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="btn-icon" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && bookings.length > 0 && (
        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">ASC</label>
            <select
              value={selectedAscFilter}
              onChange={(e) => setSelectedAscFilter(e.target.value)}
              className="filter-select"
            >
              <option key="all" value="all">All ASCs</option>
              <option key="unassigned" value="unassigned">Not Assigned</option>
              {Array.from(
                new Set(
                  (bookings || []).map(b => b.asc_name).filter(Boolean)
                )
              ).map((ascName, index) => (
                <option key={ascName} value={ascName}>
                  {ascName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="approved">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Date</label>
            <div className="toggle-group">
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={showPickedOnly}
                  onChange={(e) => setShowPickedOnly(e.target.checked)}
                />
                <span className="toggle-text">Date Picked</span>
              </label>
            </div>
          </div>
          
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <FaTimes className="error-icon" />
          {error}
        </div>
      )}

      {/* Modern Bookings Grid */}
      <div className="bookings-grid-wrapper">
        <div className="bookings-grid">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.missionId} className="booking-card">
                {/* Card Header */}
                <div className="card-header">
                  <div className="header-left">
                    <div className="mission-id">
                      <span className="id-badge">#{booking.missionId}</span>
                      <span className="request-date">{booking.date}</span>
                    </div>
                    <div className="farmer-info">
                      <FaUser className="farmer-icon" />
                      <span className="farmer-name">{booking.farmerName}</span>
                    </div>
                  </div>
                  <div className="header-right">
                    <div className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                      {getStatusText(booking.status)}
                    </div>
                    {booking.status === 'a' && (
                      <div className="date-picker-container">
                        <button
                          className="date-set-btn"
                          onClick={() => setDateSetupPopup({ open: true, missionId: booking.missionId, date: booking.pickedDate ? new Date(booking.pickedDate) : new Date(), payment: '' })}
                          disabled={updating}
                        >
                          {booking.pickedDate ? 'Setup' : 'Setup'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item-asc">
                      <FaIdCard className="info-icon" />
                      <span className="info-label">NIC:</span>
                      <span className="info-value">{booking.nic}</span>
                    </div>
                    <div className="info-item-asc">
                      <FaPhone className="info-icon" />
                      <span className="info-label">Mobile:</span>
                      <span className="info-value">{booking.mobile}</span>
                    </div>
                    <div className="info-item-asc">
                      <FaLeaf className="info-icon" />
                      <span className="info-label">Crop:</span>
                      <span className="info-value">{booking.cropName}</span>
                    </div>
                    <div className="info-item-asc">
                      <FaIndustry className="info-icon" />
                      <span className="info-label">Mission:</span>
                      <span className="info-value">{booking.missionType}</span>
                    </div>
                    <div className="info-item-asc">
                      <FaMapMarkerAlt className="info-icon" />
                      <span className="info-label">Land:</span>
                      <span className="info-value">{booking.landExtent}</span>
                    </div>
                    <div className="info-item-asc">
                      <FaWater className="info-icon" />
                      <span className="info-label">Water:</span>
                      <span className="info-value">{booking.needed_water}L</span>
                    </div>
                  </div>

                  {/* ASC/GND Section */}
                  <div className="asc-gnd-section">
                    <div className="asc-gnd-info">
                      <FaBuilding className="section-icon" />
                      <div className="asc-gnd-details">
                        <div className="asc-detail">
                          <span className="detail-label">ASC:</span>
                          <span className="detail-value">{booking.asc_name || booking.asc_api_name || 'Not Assigned'}</span>
                        </div>
                        <div className="gnd-detail">
                          <span className="detail-label">GND:</span>
                          <span className="detail-value">{booking.gnd || 'Not Assigned'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="assign-btn"
                      onClick={() => openAscGndPopup(booking)}
                      disabled={leaderLoading}
                    >
                      {booking.asc_name || booking.gnd ? 'Change' : 'Assign'}
                    </button>
                  </div>

                  {/* Broker Section */}
                  {booking.broker_name && (
                    <div className="broker-section">
                      <FaUserTie className="broker-icon" />
                      <div className="broker-details">
                        <span className="broker-name">{booking.broker_name}</span>
                        <span className="broker-code">({booking.broker_code})</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="card-actions">
                  <div className="action-buttons">
                    <button
                      className="action-btn details-btn"
                      onClick={() => handleDetailsClick(booking)}
                    >
                      <FaExpandAlt className="btn-icon" />
                      Details
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditClick(booking)}
                    >
                      <FaEdit className="btn-icon" />
                      Edit
                    </button>
                  </div>
                  <div className="status-control-asc">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.missionId, e.target.value)}
                      disabled={statusUpdating === booking.missionId || (booking.pickedDate && booking.status === 'a')}
                      className="status-select-asc"
                      style={{ borderColor: getStatusColor(booking.status) }}
                    >
                      <option value="p">Pending</option>
                      <option value="a">Confirm</option>
                      <option value="d">Declined</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaCalendarAlt />
                </div>
                <h3 className="empty-title">No Bookings Found</h3>
                <p className="empty-description">
                  {defaultQueueView 
                    ? "No bookings in queue. Try adjusting filters or date range."
                    : "No bookings match your current filters. Try adjusting the date range or filters."
                  }
                </p>
              </div>
            )
          )}
        </div>
        {loading && (
          <div className="bookings-loading-overlay">
            <Bars
              height={60}
              width={60}
              backgroundColor="#004B71"
              color="#004B71"
              ariaLabel="bars-loading"
              visible={true}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBooking(null);
          setModalMode('details');
          setEditableData({});
        }}
        booking={selectedBooking}
        mode={modalMode}
        editableData={editableData}
        setEditableData={setEditableData}
        onUpdate={handleUpdate}
        updating={updating}
        sectorOptions={sectorOptions}
        cropOptions={cropOptions}
        missionOptions={missionOptions}
        timeOptions={timeOptions}
        chemicalOptions={chemicalOptions}
        brokerOptions={brokerOptions}
      />

      {/* Date + Payment Setup Popup */}
      {dateSetupPopup.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ position: 'relative', background: '#fff', borderRadius: 12, padding: 20, width: 'min(420px, 92vw)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <button
              onClick={() => setDateSetupPopup({ open: false, missionId: null, date: null, payment: '' })}
              aria-label="Close"
              title="Close"
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                color: '#ef4444',
                fontWeight: 800,
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Setup Date & Payment</h4>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Date</label>
                <DatePicker
                  selected={dateSetupPopup.date}
                  onChange={(d) => setDateSetupPopup(prev => ({ ...prev, date: d }))}
                  dateFormat="yyyy-MM-dd"
                  className="date-picker-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Payment</label>
                <select
                  value={dateSetupPopup.payment}
                  onChange={(e) => setDateSetupPopup(prev => ({ ...prev, payment: e.target.value }))}
                  className="status-select-asc"
                  style={{ height: 36, width: '100%' }}
                >
                  <option value="">Select Payment</option>
                  <option value="ca">Cash</option>
                  <option value="cr">Credit</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button
                className="action-btn"
                onClick={() => setDateSetupPopup({ open: false, missionId: null, date: null, payment: '' })}
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca'
                }}
              >
                Cancel
              </button>
              <button
                className="action-btn primary"
                onClick={() => handleConfirmPlannedDate(dateSetupPopup.missionId)}
                disabled={updating || !dateSetupPopup.date || !dateSetupPopup.payment}
              >
                {updating ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASC + GND Assignment Popup */}
      {ascGndPopupOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 20, width: 'min(500px, 92vw)' }}>
            <h4 style={{ marginTop: 0, marginBottom: 16 }}>Assign ASC and GND</h4>
            <div className="floating-label-input" style={{ marginBottom: 12 }}>
              <select
                className="input-floating"
                value={ascGndSelection.ascId || ''}
                onChange={(e) => {
                  const nextAscCode = e.target.value || '';
                  const ascObj = ascOptions.find(a => String(a.asc_id) === String(nextAscCode)) || null;
                  setAscGndSelection(prev => ({
                    ...prev,
                    ascId: nextAscCode,
                    gndOptions: ascObj?.gnds || [],
                    gndId: ''
                  }));
                }}
              >
                <option key="select-asc" value="">Select ASC</option>
                {ascOptions.map(a => (
                  <option key={`${a.id}-${a.asc_id}`} value={a.asc_id}>{a.name} {a.code ? `(${a.code})` : ''}</option>
                ))}
              </select>
            </div>
            {ascGndSelection.ascId && (
              <div className="floating-label-input" style={{ marginBottom: 12 }}>
                <select
                  className="input-floating"
                  value={ascGndSelection.gndId || ''}
                  onChange={(e) => setAscGndSelection(prev => ({ ...prev, gndId: e.target.value }))}
                >
                  <option key="select-gnd" value="">Select GND</option>
                  {(ascGndSelection.gndOptions || []).map(g => (
                    <option key={`${g.id}-${g.gnd}`} value={g.id}>{g.gnd}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button className="action-btn" onClick={() => setAscGndPopupOpen(false)} disabled={isAssigningAscGnd}>Cancel</button>
              <button className="action-btn primary" onClick={handleConfirmAscGnd} disabled={isAssigningAscGnd || !ascGndSelection.ascId}>
                {isAssigningAscGnd ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;