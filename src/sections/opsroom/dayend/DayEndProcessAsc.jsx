import React, { useState } from 'react';
import '../../../styles/dayendprocessasc.css';
import DatePicker from 'react-datepicker';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';

const DayEndProcessAsc = () => {
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [plansData, setPlansData] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    try {
      const formattedDate = date.toLocaleDateString('en-CA');
      const result = await dispatch(baseApi.endpoints.getMissionsByPlannedDate.initiate(formattedDate));
      const response = result.data;
      
      if (response.status === "true") {
        // Convert object response to array of plans
        const plansArray = Object.keys(response)
          .filter(key => !isNaN(key)) // Filter numeric keys
          .map(key => response[key]);
        setPlansData(plansArray);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlansData([]);
    }
  };

  return (
    <div className="servicdayendprocessasces">
      <div className="left-ascdayend">
        <div-datepick-ascdayend>
          <h2>Select Date</h2>
          <DatePicker 
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
          />
        </div-datepick-ascdayend>
        <div className="listing-part-dayend">
          <div className="list-asc-tile">
            {plansData.map((plan, index) => (
              <div 
                key={index} 
                className="plan-item"
                onClick={() => setSelectedPlan(plan)}
              >
                <h3>{plan.farmer_name}</h3>
                <p>Extent: {plan.area} acres</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="right-ascdayend">
        
      </div>
    </div>
  );
};

export default DayEndProcessAsc;