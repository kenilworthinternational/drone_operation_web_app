import React, { useState, useEffect } from "react";
import DatePicker from 'react-datepicker';
import { Bars } from 'react-loader-spinner';
import '../../../styles/opsreport8.css';
import 'react-datepicker/dist/react-datepicker.css';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import * as XLSX from "xlsx";
import { FiDownload } from "react-icons/fi";

const CancelledFieldsByTeamLead = () => {
  const dispatch = useAppDispatch();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [reasonFilter, setReasonFilter] = useState('');
  const [estateFilter, setEstateFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [plantationFilter, setPlantationFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [reasonOptions, setReasonOptions] = useState([]);
  const [estateOptions, setEstateOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [plantationOptions, setPlantationOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);

  // Format date to YYYY-MM-DD for API
  const formatDate = (date) => {
    return date.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD
  };

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await dispatch(baseApi.endpoints.getCancelledFieldsByTeamLead.initiate({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        group: '0',
        plantation: '0',
        region: '0',
        estate: '0'
      }));
      const response = result.data;

      if (response && response.status === "true" && response.reason) {
        const reasons = response.reason;
        setData(reasons);
        
        // Extract unique values for filtering
        const estates = new Set();
        const reasonsList = new Set();
        const groups = new Set();
        const plantations = new Set();
        const regions = new Set();
        
        reasons.forEach(reason => {
          reasonsList.add(reason.reason);
          if (reason.plans) {
            reason.plans.forEach(plan => {
              estates.add(plan.plan_estate_name);
              groups.add(plan.plan_group_name);
              plantations.add(plan.plan_plantation_name);
              regions.add(plan.plan_region_name);
            });
          }
        });
        
        setEstateOptions([...estates].sort());
        setReasonOptions([...reasonsList].sort());
        setGroupOptions([...groups].sort());
        setPlantationOptions([...plantations].sort());
        setRegionOptions([...regions].sort());
        
        // Apply filters
        applyFilters(reasons, reasonFilter, estateFilter, groupFilter, plantationFilter, regionFilter);
      } else {
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching cancelled fields data:', error);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to data
  const applyFilters = (dataToFilter, reasonFilterValue, estateFilterValue, groupFilterValue, plantationFilterValue, regionFilterValue) => {
    let filtered = dataToFilter.filter(reason => {
      // Only show reasons with plans (plan_count > 0)
      if (reason.plan_count === 0) return false;
      
      // Apply reason filter
      if (reasonFilterValue && reason.reason !== reasonFilterValue) {
        return false;
      }
      
      // Apply filters based on plans
      if (reason.plans && (estateFilterValue || groupFilterValue || plantationFilterValue || regionFilterValue)) {
        const hasMatchingPlan = reason.plans.some(plan => {
          // Check all filters
          if (estateFilterValue && plan.plan_estate_name !== estateFilterValue) return false;
          if (groupFilterValue && plan.plan_group_name !== groupFilterValue) return false;
          if (plantationFilterValue && plan.plan_plantation_name !== plantationFilterValue) return false;
          if (regionFilterValue && plan.plan_region_name !== regionFilterValue) return false;
          return true;
        });
        if (!hasMatchingPlan) return false;
      }
      
      return true;
    });
    
    // Filter plans within each reason based on all applied filters
    if (estateFilterValue || groupFilterValue || plantationFilterValue || regionFilterValue) {
      filtered = filtered.map(reason => ({
        ...reason,
        plans: reason.plans ? reason.plans.filter(plan => {
          if (estateFilterValue && plan.plan_estate_name !== estateFilterValue) return false;
          if (groupFilterValue && plan.plan_group_name !== groupFilterValue) return false;
          if (plantationFilterValue && plan.plan_plantation_name !== plantationFilterValue) return false;
          if (regionFilterValue && plan.plan_region_name !== regionFilterValue) return false;
          return true;
        }) : []
      }));
    }
    
    // Group the filtered data to combine same estate+reason combinations
    const groupedData = groupDataByEstateAndReason(filtered);
    setFilteredData(groupedData);
  };

  // Group data by Estate and Reason to avoid duplicate rows
  const groupDataByEstateAndReason = (data) => {
    const groupedMap = new Map();
    
    data.forEach(reason => {
      if (reason.plans && reason.plans.length > 0) {
        reason.plans.forEach(plan => {
          const key = `${plan.plan_group_name}-${plan.plan_plantation_name}-${plan.plan_region_name}-${plan.plan_estate_name}-${reason.reason}`;
          
          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              reason: reason.reason,
              plans: [{
                plan_group_name: plan.plan_group_name,
                plan_plantation_name: plan.plan_plantation_name,
                plan_region_name: plan.plan_region_name,
                plan_estate_name: plan.plan_estate_name,
                fields: []
              }]
            });
          }
          
          const groupedItem = groupedMap.get(key);
          const groupedPlan = groupedItem.plans[0];
          
          // Add fields from this plan to the grouped plan
          if (plan.fields) {
            plan.fields.forEach(field => {
              groupedPlan.fields.push(field);
            });
          }
        });
      }
    });
    
    return Array.from(groupedMap.values());
  };

  // Handle filter changes
  useEffect(() => {
    applyFilters(data, reasonFilter, estateFilter, groupFilter, plantationFilter, regionFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reasonFilter, estateFilter, groupFilter, plantationFilter, regionFilter, data]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Prepare data for Excel export
  const prepareExcelData = () => {
    const excelData = [];
    
    filteredData.forEach(reason => {
      if (reason.plans && reason.plans.length > 0) {
        reason.plans.forEach(plan => {
          const fieldsString = plan.fields ? 
            plan.fields.map(field => field.field_short_name).join(', ') : '';
          const cancelledArea = plan.fields ? 
            plan.fields.reduce((sum, field) => sum + (field.field_area || 0), 0).toFixed(2) : '0.00';
          
          excelData.push({
            'Group': plan.plan_group_name || '',
            'Plantation': plan.plan_plantation_name || '',
            'Region': plan.plan_region_name || '',
            'Estate': plan.plan_estate_name || '',
            'Reason': reason.reason || '',
            'Fields': fieldsString,
            'Number of Fields': plan.fields ? plan.fields.length : 0,
            'Cancelled Area': cancelledArea
          });
        });
      }
    });
    
    return excelData;
  };

  // Export to Excel
  const exportToExcel = () => {
    const excelData = prepareExcelData();
    
    // Add summary row to Excel data
    if (excelData.length > 0) {
      const totalFields = filteredData.reduce((total, reason) => {
        return total + (reason.plans ? reason.plans.reduce((planTotal, plan) => {
          return planTotal + (plan.fields ? plan.fields.length : 0);
        }, 0) : 0);
      }, 0);
      
      const totalArea = filteredData.reduce((total, reason) => {
        return total + (reason.plans ? reason.plans.reduce((planTotal, plan) => {
          return planTotal + (plan.fields ? plan.fields.reduce((sum, field) => sum + (field.field_area || 0), 0) : 0);
        }, 0) : 0);
      }, 0);
      
      excelData.push({
        'Group': '',
        'Plantation': '',
        'Region': '',
        'Estate': '',
        'Reason': 'TOTAL',
        'Fields': 'All Fields',
        'Number of Fields': totalFields,
        'Cancelled Area': totalArea.toFixed(2)
      });
    }
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cancelled Fields by Team Lead");
    
    const fileName = `Cancelled_Fields_TeamLead_${formatDate(startDate)}_to_${formatDate(endDate)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="ops-report-container-opsreport8">
      <div className="ops-report-header-opsreport8">
        
        <div className="ops-controls-opsreport8">
          <div className="date-controls-opsreport8">
            <div className="date-group-opsreport8">
              <label>Start Date:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy/MM/dd"
                className="date-picker-opsreport8"
                disabled={loading}
              />
            </div>
            
            <div className="date-group-opsreport8">
              <label>End Date:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy/MM/dd"
                className="date-picker-opsreport8"
                disabled={loading}
              />
            </div>
          </div>

          <div className="filter-controls-opsreport8">
            {/* Top row: Group, Plantation, Region, Estate */}
            <div className="filter-row-top-opsreport8">
              <div className="filter-group-opsreport8">
                <label>Group:</label>
                <select 
                  value={groupFilter} 
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="filter-select-opsreport8"
                >
                  <option value="">All Groups</option>
                  {groupOptions.map((group, index) => (
                    <option key={index} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group-opsreport8">
                <label>Plantation:</label>
                <select 
                  value={plantationFilter} 
                  onChange={(e) => setPlantationFilter(e.target.value)}
                  className="filter-select-opsreport8"
                >
                  <option value="">All Plantations</option>
                  {plantationOptions.map((plantation, index) => (
                    <option key={index} value={plantation}>{plantation}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group-opsreport8">
                <label>Region:</label>
                <select 
                  value={regionFilter} 
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="filter-select-opsreport8"
                >
                  <option value="">All Regions</option>
                  {regionOptions.map((region, index) => (
                    <option key={index} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group-opsreport8">
                <label>Estate:</label>
                <select 
                  value={estateFilter} 
                  onChange={(e) => setEstateFilter(e.target.value)}
                  className="filter-select-opsreport8"
                >
                  <option value="">All Estates</option>
                  {estateOptions.map((estate, index) => (
                    <option key={index} value={estate}>{estate}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom row: Reason + Export */}
            <div className="filter-row-bottom-opsreport8">
              <div className="filter-group-opsreport8">
                <label>Reason:</label>
                <select 
                  value={reasonFilter} 
                  onChange={(e) => setReasonFilter(e.target.value)}
                  className="filter-select-opsreport8"
                >
                  <option value="">All Reasons</option>
                  {reasonOptions.map((reason, index) => (
                    <option key={index} value={reason}>{reason}</option>
                  ))}
                </select>
                
              </div>
              <div className="actions-row-opsreport8">
                <button 
                  onClick={exportToExcel} 
                  className="export-btn-opsreport8"
                  disabled={loading || filteredData.length === 0}
                >
                  <FiDownload />
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          {/* <div className="action-buttons"> */}
            {/* <button 
              onClick={clearAllFilters} 
              className="clear-btn"
              disabled={loading}
            >
              Clear Filters
            </button> */}

            {/* <button 
              onClick={fetchData} 
              className="refresh-btn"
              disabled={loading}
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} />
              Refresh
            </button> */}
            
          {/* </div> */}
        </div>
      </div>

      <div className="ops-report-content-opsreport8">
        {loading ? (
          <div className="loading-container-opsreport8">
            <Bars
              height="80"
              width="80"
              color="#004B71"
              ariaLabel="bars-loading"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
            <p>Loading cancelled fields data...</p>
          </div>
        ) : (
          <div className="table-container-opsreport8">
            {filteredData.length > 0 ? (
              <table className="ops-table-opsreport8">
                <thead>
                  <tr>
                    <th>Group </th>
                    <th>Plantation</th>
                    <th>Region</th>
                    <th>Estate</th>
                    <th>Reason</th>
                    <th>Fields</th>
                    <th>Number of Fields</th>
                    <th>Cancelled Area</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((reason, reasonIndex) => (
                    reason.plans && reason.plans.map((plan, planIndex) => {
                      const fieldsString = plan.fields ? 
                        plan.fields.map(field => field.field_short_name).join(', ') : '';
                      const fieldsCount = plan.fields ? plan.fields.length : 0;
                      const cancelledArea = plan.fields ? 
                        plan.fields.reduce((sum, field) => sum + (field.field_area || 0), 0).toFixed(2) : '0.00';
                      
                      return (
                        <tr key={`${reasonIndex}-${planIndex}`}>
                          <td>{plan.plan_group_name || ''}</td>
                          <td>{plan.plan_plantation_name || ''}</td>
                          <td>{plan.plan_region_name || ''}</td>
                          <td>{plan.plan_estate_name || ''}</td>
                          <td>{reason.reason || ''}</td>
                          <td className="fields-cell-opsreport8">{fieldsString}</td>
                          <td className="fields-count-cell-opsreport8">{fieldsCount}</td>
                          <td className="area-cell-opsreport8">{cancelledArea}</td>
                        </tr>
                      );
                    })
                  ))}
                  {/* Summary Row */}
                  {filteredData.length > 0 && (
                    <tr className="summary-row-opsreport8">
                      <td colSpan="5" className="summary-label-opsreport8"><strong>Total</strong></td>
                      <td className="summary-fields-opsreport8">
                        <strong>All Fields</strong>
                      </td>
                      <td className="summary-fields-opsreport8">
                        <strong>
                          {filteredData.reduce((total, reason) => {
                            return total + (reason.plans ? reason.plans.reduce((planTotal, plan) => {
                              return planTotal + (plan.fields ? plan.fields.length : 0);
                            }, 0) : 0);
                          }, 0)}
                        </strong>
                      </td>
                      <td className="area-cell-opsreport8 summary-area-opsreport8">
                        <strong>
                          {filteredData.reduce((total, reason) => {
                            return total + (reason.plans ? reason.plans.reduce((planTotal, plan) => {
                              return planTotal + (plan.fields ? plan.fields.reduce((sum, field) => sum + (field.field_area || 0), 0) : 0);
                            }, 0) : 0);
                          }, 0).toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="no-data-opsreport8">
                <p>No cancelled fields data found for the selected criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelledFieldsByTeamLead;
