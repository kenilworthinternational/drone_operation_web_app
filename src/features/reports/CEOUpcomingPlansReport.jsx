import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getSummaryDataGroupAllDateRange } from '../../api/api';
import { Bars } from 'react-loader-spinner';
import '../../styles/reportpartceobottom.css';

const ReportPartCEOBottom = ({ dateRange }) => {
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userGroupId = userData.group;
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMissions, setExpandedMissions] = useState({});
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const startDate = dateRange.startDate.toLocaleDateString('en-CA');
      const endDate = dateRange.endDate.toLocaleDateString('en-CA');
      const data = await getSummaryDataGroupAllDateRange(userGroupId, startDate, endDate);

      if (data?.status === "true") {
        const groupedData = Object.values(data)
          .filter(item => typeof item === 'object' && item.id)
          .reduce((acc, mission) => {
            acc[mission.date] = acc[mission.date] || [];
            acc[mission.date].push(mission);
            return acc;
          }, {});
        setSummaryData(groupedData);
      } else {
        setError("No data available");
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userGroupId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpand = (missionId) => {
    setExpandedMissions(prev => ({
      ...prev,
      [missionId]: !prev[missionId],
    }));
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <div className="report-part2 loading">
        <Bars color="#00BFFF" height={50} width={50} />
      </div>
    );
  }

  if (error) {
    return <div className="report-part2 error">{error}</div>;
  }

  if (!summaryData) {
    return <div className="report-part2">No data available</div>;
  }

  return (
    <div className="report-partceo2">
      <h2 style={{ textAlign: 'center' }}>Upcoming Plans</h2>
      <div
        className="date-containers-wrapper"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {Object.entries(summaryData).map(([date, missions]) => (
          <div key={date} className="date-containerceobottom">
            <div className="date-headerceobottom">
              <h3>{date}</h3>
            </div>
            <div className="missions-listceobottom">
              {missions.map(mission => (
                <div key={mission.id} className="mission-containerceobottom">
                  <div
                    className="mission-rowceobottom"
                    onClick={() => toggleExpand(mission.id)}
                  >
                    <div className="estate-infoceobottom">
                      <span className="estate-nameceobottom">{mission.estate}</span>
                      <span className="estate-idceobottom">({mission.estate_id})</span>
                    </div>
                    <div className="mission-areaceobottom">{mission.area} Ha</div>
                  </div>
                  {expandedMissions[mission.id] && (
                    <div className="mission-detailsceobottom">
                      <div className="mission-headerceobottom">
                        <h4>{mission.estate} - {mission.mission_type_name}</h4>
                        <div className="mission-metaceobottom">
                          <span>Total Area: {mission.area} Ha</span>
                          <span>
                            Status: {mission.flag === 'ap' ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <div className="divisions-containerceobottom">
                        {mission.diviions.map(division => (
                          <div key={division.id} className="division-cardceobottom">
                            <h5>{division.division}</h5>
                            <div className="fields-gridceobottom">
                              {division.fields.map(field => (
                                <div key={field.id} className="field-cardceobottom">
                                  <div className="field-nameceobottom">
                                    {field.field_short_name}
                                  </div>
                                  <div className="field-areaceobottom">{field.area} Ha</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportPartCEOBottom;