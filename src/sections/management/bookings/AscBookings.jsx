import { useState, React, useEffect } from 'react';
import '../../styles/ascBookings.css';
import { baseApi } from '../../../api/services/allEndpoints';
import { useAppDispatch } from '../../../store/hooks';
import { Bars } from 'react-loader-spinner';
import SearchableBrokerDropdown from '../../../components/SearchableBrokerDropdown';
import SearchableAscDropdown from '../../../components/SearchableAscDropdown';

const AscBookings = () => {
    const dispatch = useAppDispatch();
    const [mobile, setMobile] = useState("");
    const [nic, setNic] = useState("");
    const [farmerName, setFarmerName] = useState("");
    const [address, setAddress] = useState("");
    const [landAddress, setLandAddress] = useState("");
    const [regNo, setRegNo] = useState("");
    const [searchId, setSearchId] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [ascOptions, setAscOptions] = useState([]);
    const [isLoadingAsc, setIsLoadingAsc] = useState(false);
    const [ascError, setAscError] = useState("");
    const [gndOptions, setGndOptions] = useState([]);
    const [isLoadingGnd, setIsLoadingGnd] = useState(false);
    const [gndError, setGndError] = useState("");
    const [isLoadingCrops, setIsLoadingCrops] = useState(true);
    const [cropError, setCropError] = useState(null);
    const [cropOptions, setCropOptions] = useState([]);
    const [missionOptions, setMissionOptions] = useState([]);
    const [isLoadingMissions, setIsLoadingMissions] = useState(true);
    const [missionError, setMissionError] = useState(null);
    const [chemicalOptions, setChemicalOptions] = useState([]);
    const [isLoadingChemicals, setIsLoadingChemicals] = useState(false);
    const [chemicalError, setChemicalError] = useState(null);
    const [timeOptions, setTimeOptions] = useState([]);
    const [isLoadingTimes, setIsLoadingTimes] = useState(true);
    const [timeError, setTimeError] = useState(null);
    const [stageOptions, setStageOptions] = useState([]);
    const [isLoadingStages, setIsLoadingStages] = useState(true);
    const [stageError, setStageError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sectorOptions, setSectorOptions] = useState([]);
    const [isLoadingSectors, setIsLoadingSectors] = useState(true);
    const [sectorError, setSectorError] = useState(null);
    const [farmerId, setFarmerId] = useState("");
    const [isNewFarmer, setIsNewFarmer] = useState(false);
    const [brokerId, setBrokerId] = useState("");
    const [brokerOptions, setBrokerOptions] = useState([]);
    const [isLoadingBrokers, setIsLoadingBrokers] = useState(true);
    const [brokerError, setBrokerError] = useState(null);
    // Previously used lands from API and popup state
    const [previousLands, setPreviousLands] = useState([]);
    const [showHistoryPopup, setShowHistoryPopup] = useState(false);

    // New state for multiple lands
    const [lands, setLands] = useState([
        { id: 1, landName: "Land 1", landAddress: "", extent: "", originalLandId: null, appliedFromId: null, appliedFromName: "" }
    ]);
    const [currentLandIndex, setCurrentLandIndex] = useState(0);

    // New state for per-land form data
    const [landFormData, setLandFormData] = useState({
        1: {
            stage: "",
            agroChemical: "",
            units: "",
            neededWater: "",
            selectedDate: "",
            selectedTime: "",
            ascCenter: "",
            gndCenter: "",
            sector: "",
            cropType: "",
            missionType: "",
            chemicalProvided: false
        }
    });

    // Initialize form data for new lands
    const initializeLandFormData = (landId) => {
        if (!landFormData[landId]) {
            setLandFormData(prev => ({
                ...prev,
                [landId]: {
                    stage: "",
                    agroChemical: "",
                    units: "",
                    neededWater: "",
                    selectedDate: "",
                    selectedTime: "",
                    ascCenter: "",
                    gndCenter: "",
                    sector: "",
                    cropType: "",
                    missionType: "",
                    chemicalProvided: false
                }
            }));
        }
    };

    // Update form data for specific land
    const updateLandFormData = (landId, field, value) => {
        setLandFormData(prev => ({
            ...prev,
            [landId]: {
                ...prev[landId],
                [field]: value
            }
        }));
    };

    // Get current land's form data
    const getCurrentLandFormData = () => {
        const currentLandId = lands[currentLandIndex]?.id;
        return landFormData[currentLandId] || {};
    };

    // Functions to handle multiple lands
    const addLand = () => {
        const newId = Math.max(...lands.map(land => land.id)) + 1;
        const landNumber = lands.length + 1;
        setLands([...lands, { id: newId, landName: `Land ${landNumber}`, landAddress: "", extent: "", originalLandId: null, appliedFromId: null, appliedFromName: "" }]);
        setCurrentLandIndex(lands.length); // Move to the new land
        initializeLandFormData(newId); // Initialize form data for the new land
    };

    const removeLand = (id) => {
        if (lands.length > 1) {
            const updatedLands = lands.filter(land => land.id !== id);
            // Renumber the remaining lands
            const renumberedLands = updatedLands.map((land, index) => ({
                ...land,
                landName: land.landName.startsWith('Land ') ? `Land ${index + 1}` : land.landName
            }));
            setLands(renumberedLands);
            // Adjust current index if needed
            if (currentLandIndex >= renumberedLands.length) {
                setCurrentLandIndex(renumberedLands.length - 1);
            }
            // Remove corresponding form data
            setLandFormData(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        }
    };

    const updateLand = (id, field, value) => {
        // Use functional state update to avoid losing preceding changes when called multiple times sequentially
        setLands(prevLands => prevLands.map(land =>
            land.id === id ? { ...land, [field]: value } : land
        ));
    };

    const handleExtentChangeForLand = (id, value) => {
        // Only allow digits and one optional dot with up to 2 decimal places
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            updateLand(id, 'extent', value);
        }
    };

    const navigateToLand = (direction) => {
        if (direction === 'prev' && currentLandIndex > 0) {
            const newIndex = currentLandIndex - 1;
            setCurrentLandIndex(newIndex);
            // Initialize form data for the new land if it doesn't exist
            const landId = lands[newIndex]?.id;
            if (landId) {
                initializeLandFormData(landId);
            }
        } else if (direction === 'next' && currentLandIndex < lands.length - 1) {
            const newIndex = currentLandIndex + 1;
            setCurrentLandIndex(newIndex);
            // Initialize form data for the new land if it doesn't exist
            const landId = lands[newIndex]?.id;
            if (landId) {
                initializeLandFormData(landId);
            }
        }
    };




    // Initialize form data for the first land when component mounts
    useEffect(() => {
        if (lands.length > 0) {
            initializeLandFormData(lands[0].id);
        }
    }, []);



    // Unified data fetching configuration
    const dataFetchConfig = [
        {
            key: 'crops',
            fetcher: () => dispatch(baseApi.endpoints.getCropTypes.initiate()).unwrap(),
            setData: setCropOptions,
            setLoading: setIsLoadingCrops,
            setError: setCropError
        },
        {
            key: 'times',
            fetcher: () => dispatch(baseApi.endpoints.getTimeSlots.initiate()).unwrap(),
            setData: setTimeOptions,
            setLoading: setIsLoadingTimes,
            setError: setTimeError
        },
        {
            key: 'stages',
            fetcher: () => dispatch(baseApi.endpoints.getStages.initiate()).unwrap(),
            setData: setStageOptions,
            setLoading: setIsLoadingStages,
            setError: setStageError
        },
        {
            key: 'sectors',
            fetcher: () => dispatch(baseApi.endpoints.getSectors.initiate()).unwrap(),
            setData: setSectorOptions,
            setLoading: setIsLoadingSectors,
            setError: setSectorError
        },
        {
            key: 'missions',
            fetcher: () => dispatch(baseApi.endpoints.getMissionTypes.initiate()).unwrap(),
            setData: setMissionOptions,
            setLoading: setIsLoadingMissions,
            setError: setMissionError
        },
        {
            key: 'ascCenters',
            fetcher: () => dispatch(baseApi.endpoints.getASCs.initiate()).unwrap(),
            setData: setAscOptions,
            setLoading: setIsLoadingAsc,
            setError: setAscError,
            processResponse: (response) => {
                if (response?.ascs && Array.isArray(response.ascs)) {
                    return response.ascs;
                }
                if (Array.isArray(response)) {
                    return response;
                }
                if (response?.data && Array.isArray(response.data)) {
                    return response.data;
                }
                return [];
            }
        },
        {
            key: 'brokers',
            fetcher: () => dispatch(baseApi.endpoints.getBrokers.initiate()).unwrap(),
            setData: setBrokerOptions,
            setLoading: setIsLoadingBrokers,
            setError: setBrokerError,
            processResponse: (response) => {
                if (response?.brokers && Array.isArray(response.brokers)) {
                    return response.brokers;
                }
                if (Array.isArray(response)) {
                    return response;
                }
                if (response?.data && Array.isArray(response.data)) {
                    return response.data;
                }
                return [];
            }
        },
        {
            key: 'chemicals',
            fetcher: () => dispatch(baseApi.endpoints.getChemicalTypes.initiate()).unwrap(),
            setData: setChemicalOptions,
            setLoading: setIsLoadingChemicals,
            setError: setChemicalError,
            processResponse: (response) => {
                // Handle different response formats
                let chemicalsArray = [];
                
                if (Array.isArray(response)) {
                    // If response is directly an array
                    if (response.length > 0 && Array.isArray(response[0])) {
                        // If response is [[{...}, {...}, ...]] format (nested array)
                        chemicalsArray = response[0];
                    } else {
                        // If response is [{...}, {...}, ...] format (flat array)
                        chemicalsArray = response;
                    }
                } else if (response && Array.isArray(response[0])) {
                    // If response is {0: [...]} format
                    chemicalsArray = response[0];
                } else if (response && response.chemicals) {
                    // If response has a chemicals property
                    chemicalsArray = response.chemicals;
                } else if (response && response.data) {
                    // If response has a data property
                    chemicalsArray = response.data;
                }
                
                return chemicalsArray || [];
            }
        }
    ];

    // Unified data fetching effect
    useEffect(() => {
        const fetchData = async () => {
            await Promise.allSettled(dataFetchConfig.map(async (config) => {
                const { key, fetcher, setData, setLoading, setError, dependsOn, processResponse } = config;

                // Always fetch chemicals for now
                // TODO: Implement dependency logic if needed later

                try {
                    setLoading?.(true);
                    const response = await fetcher();
                    
                    const processedData = processResponse ? processResponse(response) : response;
                    
                    setData(processedData || []);
                } catch (error) {
                    console.error(`Error fetching ${key}:`, error);
                    setError?.(error?.message || 'Failed to load data');
                    setData([]);
                } finally {
                    setLoading?.(false);
                }
            }));
        };

        fetchData();
    }, [dispatch]); // Fetch data once on component mount


    const handleAddFarmer = async () => {
        console.log("came here");
        try {
            console.log("came here2", farmerName, nic, address, mobile);
            const farmerResponse = await dispatch(
                baseApi.endpoints.addFarmer.initiate({
                    name: farmerName,
                    nic: nic,
                    address: address,
                    telephone: mobile
                })
            ).unwrap();

            if (farmerResponse.status !== 'true' || !farmerResponse.id) {
                throw new Error('Farmer creation failed');
            }
            setFarmerId(farmerResponse.id);
            return farmerResponse.id;
        } catch (error) {
            alert(`Error adding farmer: ${error.message}`);
        }
    };


    const handleSubmit = async () => {
        // Validation for required fields
        if (!farmerName || !nic || !mobile) {
            alert('Please fill all required fields including Farmer Name, NIC, and Mobile.');
            return;
        }

        // Validation for lands and their form data
        const invalidLands = lands.filter(land => {
            const landData = landFormData[land.id];
            return !land.landName || !land.extent || 
                   !landData?.ascCenter || !landData?.gndCenter ||
                   !landData?.sector || !landData?.cropType || 
                   !landData?.missionType || !landData?.stage || 
                   !landData?.agroChemical || !landData?.neededWater || 
                   !landData?.selectedDate || !landData?.selectedTime;
        });
        
        if (invalidLands.length > 0) {
            alert('Please fill all required fields for each land including ASC Center, GND, Sector, Crop Type, Mission Type, Stage, Agro Chemical, Needed Water, Date, and Time.');
            return;
        }

        try {
            let finalFarmerId = farmerId;

            // Handle farmer creation/update
            if (finalFarmerId) {
                // Update existing farmer
                await dispatch(
                    baseApi.endpoints.updateFarmer.initiate({
                        id: finalFarmerId,
                        name: farmerName,
                        nic: nic,
                        address: address,
                        telephone: mobile
                    })
                ).unwrap();
            } else {
                throw new Error('Farmer not found. Please search again.');
            }

            // Create missions for each land
            const missionPromises = lands.map(async (land) => {
                const landData = landFormData[land.id];
                const bookingData = {
                    farmer_id: finalFarmerId,
                    // Pass backend land id when applying from history, otherwise empty string
                    land_id: land.originalLandId ?? "",
                    land_name: land.landName,
                    land_address: land.landAddress,
                    land_extent: parseFloat(land.extent),
                    register_no: regNo,
                    sector: landData.sector,
                    crop_type: landData.cropType,
                    broker: brokerId,
                    mission_type: landData.missionType,
                    chemical: landData.agroChemical,
                    chemical_provided: landData.chemicalProvided ? "1" : "0",
                    units: landData.units || "",
                    needed_water: parseFloat(landData.neededWater),
                    date_requested: landData.selectedDate,
                    date_planed: "",
                    pick_time: landData.selectedTime,
                    select_stage: landData.stage,
                    asc: landData.ascCenter,
                    gnd: landData.gndCenter
                };

                return await dispatch(
                    baseApi.endpoints.createMission.initiate(bookingData)
                ).unwrap();
            });

            // Wait for all missions to be created
            const results = await Promise.allSettled(missionPromises);



            // Check results - handle both API response formats
            const successfulMissions = results.filter(result => {
                if (result.status === 'rejected') return false;
                const response = result.value;

                // Handle the actual API response format from submitDataAscBooking
                if (response && typeof response.success === 'boolean') {
                    return response.success === true;
                }

                // Handle the expected format {"status": "true", "id": 1}
                if (response && (response.status === "true" || response.status === true) && response.id) {
                    return true;
                }

                return false;
            });

            const failedMissions = results.filter(result => {
                if (result.status === 'rejected') return true;
                const response = result.value;

                // Handle the actual API response format from submitDataAscBooking
                if (response && typeof response.success === 'boolean') {
                    return response.success !== true;
                }

                // Handle the expected format {"status": "true", "id": 1}
                if (response && (response.status === "true" || response.status === true) && response.id) {
                    return false;
                }

                return true;
            });

            if (failedMissions.length > 0) {
                alert(`Warning: ${failedMissions.length} out of ${lands.length} missions failed to create.`);
            }

            if (successfulMissions.length > 0) {
                // Extract mission IDs if available
                const missionIds = successfulMissions
                    .map(result => result.value?.id)
                    .filter(id => id)
                    .join(', ');

                const message = missionIds
                    ? `Successfully created ${successfulMissions.length} mission(s)! Mission ID(s): ${missionIds}`
                    : `Successfully created ${successfulMissions.length} mission(s)!`;

                alert(message);
            }

            resetForm();
            setFarmerId("");
            setIsNewFarmer(false);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleMobileChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            if (value.length === 1 && value[0] === '0') return;
            setMobile(value);
        }
    };

    // Apply a previously used land into current land slot
    const applyPreviousLandToCurrent = (prevLand) => {
        const currentId = lands[currentLandIndex]?.id;
        if (!currentId) return;

        // Batch update land values in one setLands to ensure all changes stick
        setLands(prev => prev.map(l => {
            if (l.id !== currentId) return l;
            return {
                ...l,
                landName: prevLand?.land_name || '',
                landAddress: prevLand?.land_address || '',
                extent: String(prevLand?.land_extent ?? ''),
                originalLandId: prevLand?.id ?? null,
                appliedFromId: prevLand?.id ?? null,
                appliedFromName: prevLand?.land_name || ''
            };
        }));

        // Preselect ASC and GND via form data
        if (prevLand?.asc) {
            updateLandFormData(currentId, 'ascCenter', String(prevLand.asc));
        }
        if (prevLand?.gnd) {
            updateLandFormData(currentId, 'gndCenter', String(prevLand.gnd));
        }
        setShowHistoryPopup(false);
    };

    const handleSearch = async () => {
        if (!searchId) return;

        resetFormWithoutNic();
        setIsLoading(true);
        try {
            const response = await dispatch(
                baseApi.endpoints.getFarmerByNIC.initiate(searchId)
            ).unwrap();
            if (response?.status === "true") {
                // Update fields with API response
                setNic(response.nic);
                setFarmerId(response.id);
                setFarmerName(response.name);
                setAddress(response.address);
                setMobile(response.telephone);
                // Capture previous lands if provided
                const apiLands = Array.isArray(response.lands) ? response.lands : [];
                setPreviousLands(apiLands);
                setShowPopup(false);
            } else {
                setNic(searchId);
                setPreviousLands([]);
                setShowPopup(true);
            }
            resetMissionFields();
        } catch (error) {
            console.error("Search error:", error);
            setShowPopup(true);
            setPreviousLands([]);
            resetMissionFields();
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setMobile("");
        setNic("");
        setFarmerName("");
        setAddress("");
        setLandAddress("");
        setRegNo("");
        setShowPopup(false);
        setFarmerId("");
        setIsNewFarmer(false);
        setBrokerId("");
        // Reset lands to initial state
        setLands([{ id: 1, landName: "Land 1", landAddress: "", extent: "", originalLandId: null, appliedFromId: null, appliedFromName: "" }]);
        setCurrentLandIndex(0);
        // Reset all land form data
        setLandFormData({
            1: {
                stage: "",
                agroChemical: "",
                units: "",
                neededWater: "",
                selectedDate: "",
                selectedTime: "",
                ascCenter: "",
                gndCenter: "",
                sector: "",
                cropType: "",
                missionType: "",
                chemicalProvided: false
            }
        });
    };
    const resetFormWithoutNic = () => {
        setMobile("");
        setFarmerName("");
        setAddress("");
        setLandAddress("");
        setRegNo("");
        setShowPopup(false);
        setFarmerId("");
        setIsNewFarmer(false);
        setBrokerId("");
        // Reset lands to initial state
        setLands([{ id: 1, landName: "Land 1", landAddress: "", extent: "", originalLandId: null, appliedFromId: null, appliedFromName: "" }]);
        setCurrentLandIndex(0);
        // Reset all land form data
        setLandFormData({
            1: {
                stage: "",
                agroChemical: "",
                units: "",
                neededWater: "",
                selectedDate: "",
                selectedTime: "",
                ascCenter: "",
                gndCenter: "",
                sector: "",
                cropType: "",
                missionType: "",
                chemicalProvided: false
            }
        });
    };

    const resetMissionFields = () => {
        setLandAddress("");
        setRegNo("");
        // Reset lands to initial state
        setLands([{ id: 1, landName: "Land 1", landAddress: "", extent: "", originalLandId: null, appliedFromId: null, appliedFromName: "" }]);
        setCurrentLandIndex(0);
        // Reset all land form data
        setLandFormData({
            1: {
                stage: "",
                agroChemical: "",
                units: "",
                neededWater: "",
                selectedDate: "",
                selectedTime: "",
                ascCenter: "",
                gndCenter: "",
                sector: "",
                cropType: "",
                missionType: ""
            }
        });
    };
    return (
        <div className="ascbooking">
            <div className="top-ascbooking">
                <input
                    type="text"
                    placeholder="Search NIC"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    className="search-button"
                    onClick={handleSearch}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Bars
                            color="#ffffff"
                            height={20}
                            width={20}
                            visible={isLoading}
                        />
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                            Search
                        </>
                    )}
                </button>
            </div>
            {showPopup && (
                <div className="popup-overlay-ascbooking">
                    <div className="popup-content-ascbooking">
                        <h3>User Not Found</h3>
                        <p>No customer found with this NIC. Please confirm details to create new customer.</p>
                        <div className="popup-farmer-details">
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    value={searchId}
                                    readOnly
                                    placeholder="NIC"
                                    className="input-floating"
                                />
                                <label className="label-floating">NIC
                                    <span className="red-star"> *</span>
                                </label>
                            </div>
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    value={farmerName}
                                    onChange={(e) => setFarmerName(e.target.value)}
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Address"
                                />
                            </div>
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    value={mobile}
                                    onChange={handleMobileChange}
                                    placeholder="Mobile Number"
                                />
                            </div>
                        </div>
                        <div className="popup-buttons">
                            <button
                                className="popup-close-button-ascbooking"
                                onClick={() => setShowPopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="popup-confirm-button-ascbooking"
                                onClick={async () => {
                                    try {
                                        const newFarmerId = await handleAddFarmer();
                                        setFarmerId(newFarmerId);
                                        setShowPopup(false);
                                    } catch (error) {
                                        alert(error.message);
                                    }
                                }}
                            >
                                Confirm & Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="bottom-ascbooking">
                <div className="left-ascbooking">
                    <div className="heading-booking">
                        <h4>Customer Profile Details</h4>
                    </div>
                    <div className="floating-label-input">
                        <input
                            type="text"
                            id="nic"
                            placeholder=""
                            value={nic}
                            onChange={(e) => setNic(e.target.value)}
                            className="input-floating"
                            readOnly={showPopup}  // Add this
                        />
                        <label htmlFor="name" className="label-floating">Farmer NIC
                            <span className="red-star"> *</span>
                        </label>
                    </div>
                    <div className="floating-label-input">
                        <input
                            type="text"
                            id="farmerName"
                            placeholder=""
                            value={farmerName}
                            onChange={(e) => setFarmerName(e.target.value)}
                            className="input-floating"
                        />
                        <label htmlFor="name" className="label-floating">Farmer Name
                            <span className="red-star"> *</span>
                        </label>
                    </div>
                    <div className="floating-label-input">
                        <input
                            type="text"
                            id="address"
                            placeholder=""
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="input-floating"
                        />
                        <label htmlFor="name" className="label-floating">Farmer Address
                            <span className="red-star"> *</span>
                        </label>
                    </div>
                    <div className="floating-label-input">
                        <input
                            type="text"
                            id="mobile"
                            inputMode="numeric"
                            value={mobile}
                            onChange={handleMobileChange}
                            maxLength="9"
                            className="input-floating"
                            placeholder=""
                            title="Enter a valid mobile number without starting with 0"
                        />
                        <label htmlFor="mobile" className="label-floating">
                            Farmer Mobile No
                            <span className="red-star"> *</span>
                        </label>
                    </div>
                    <SearchableBrokerDropdown
                        value={brokerId}
                        onChange={setBrokerId}
                        options={brokerOptions}
                        isLoading={isLoadingBrokers}
                        error={brokerError}
                        placeholder="Pick a Broker"
                        disabled={isLoadingBrokers || !!brokerError}
                    />

                    {/* Multiple Lands Section */}
                    <div className="lands-section">
                        <div className="lands-header">
                            <div className="lands-header-content">
                                <h5 className="lands-title">Land Details</h5>
                                <div className="lands-header-buttons">
                                    {previousLands.length > 0 && (
                                        <button
                                            type="button"
                                            className="view-history-btn"
                                            onClick={() => setShowHistoryPopup(true)}
                                            title="View previously used lands"
                                        >
                                            View history
                                        </button>
                                    )}
                                    {lands.length > 0 && (() => {
                                        const currentLand = lands[lands.length - 1];
                                        const isCurrentLandComplete = currentLand.landName && currentLand.landAddress && currentLand.extent;
                                        return isCurrentLandComplete ? (
                                            <button
                                                type="button"
                                                className="add-land-btn"
                                                onClick={addLand}
                                                title="Add another land"
                                            >
                                                ✍️
                                            </button>
                                        ) : null;
                                    })()}
                                </div>
                            </div>
                        </div>

                        {lands.length > 0 && (
                            <div className="land-entry">
                                <div className="land-header">
                                    <div className="land-navigation">
                                        <button
                                            type="button"
                                            className="nav-btn prev-btn"
                                            onClick={() => navigateToLand('prev')}
                                            disabled={currentLandIndex === 0}
                                            title="Previous land"
                                        >
                                            👈
                                        </button>
                                        <span className="land-number">Land {currentLandIndex + 1} of {lands.length}</span>
                                        <button
                                            type="button"
                                            className="nav-btn next-btn"
                                            onClick={() => navigateToLand('next')}
                                            disabled={currentLandIndex === lands.length - 1}
                                            title="Next land"
                                        >
                                            👉
                                        </button>
                                    </div>
                                    {lands.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-land-btn"
                                            onClick={() => removeLand(lands[currentLandIndex].id)}
                                            title="Remove this land"
                                        >
                                            👋
                                        </button>
                                    )}
                                </div>

                                {/* Show applied land indicator for current land */}
                                {lands[currentLandIndex].appliedFromId && (
                                    <div style={{ 
                                        margin: '8px 0', 
                                        padding: '8px 12px', 
                                        backgroundColor: '#e8f5e8', 
                                        border: '1px solid #4caf50', 
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{ fontSize: 13, color: '#2e7d32', fontWeight: 500 }}>
                                            📋 Applied from history: {lands[currentLandIndex].appliedFromName} (ID: {lands[currentLandIndex].appliedFromId})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Clear applied history and land_id
                                                updateLand(lands[currentLandIndex].id, 'originalLandId', null);
                                                updateLand(lands[currentLandIndex].id, 'appliedFromId', null);
                                                updateLand(lands[currentLandIndex].id, 'appliedFromName', '');
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#d32f2f',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                padding: '2px 6px',
                                                borderRadius: '3px'
                                            }}
                                            title="Remove applied land"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                <div className="floating-label-input">
                                    <input
                                        type="text"
                                        id={`landName-${lands[currentLandIndex].id}`}
                                        placeholder=""
                                        value={lands[currentLandIndex].landName}
                                        onChange={(e) => updateLand(lands[currentLandIndex].id, 'landName', e.target.value)}
                                        className="input-floating"
                                    />
                                    <label htmlFor={`landName-${lands[currentLandIndex].id}`} className="label-floating">
                                        Land Name
                                        <span className="red-star"> *</span>
                                    </label>
                                </div>

                                <div className="floating-label-input">
                                    <input
                                        type="text"
                                        id={`landAddress-${lands[currentLandIndex].id}`}
                                        value={lands[currentLandIndex].landAddress}
                                        placeholder=""
                                        onChange={(e) => updateLand(lands[currentLandIndex].id, 'landAddress', e.target.value)}
                                        className="input-floating"
                                    />
                                    <label htmlFor={`landAddress-${lands[currentLandIndex].id}`} className="label-floating">
                                        Land Address
                                    </label>
                                </div>

                                <div className="floating-label-input">
                                    <input
                                        type="text"
                                        id={`extent-${lands[currentLandIndex].id}`}
                                        inputMode="decimal"
                                        value={lands[currentLandIndex].extent}
                                        onChange={(e) => handleExtentChangeForLand(lands[currentLandIndex].id, e.target.value)}
                                        className="input-floating"
                                        placeholder=""
                                        title="Only numbers with up to 2 decimal places"
                                    />
                                    <label htmlFor={`extent-${lands[currentLandIndex].id}`} className="label-floating">
                                        Land Extent (Acre)
                                        <span className="red-star"> *</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="right-ascbooking">
                    <div className="heading-booking">
                        <h4>Create Booking - {lands[currentLandIndex].landName}</h4>
                        {lands.length > 1 && (
                            <div className="land-swap-buttons">
                                <button
                                    type="button"
                                    className="swap-btn prev-btn"
                                    onClick={() => navigateToLand('prev')}
                                    disabled={currentLandIndex === 0}
                                    title="Previous land"
                                >
                                    👈 Previous Land
                                </button>
                                <span className="land-counter">
                                    Land {currentLandIndex + 1} of {lands.length}
                                </span>
                                <button
                                    type="button"
                                    className="swap-btn next-btn"
                                    onClick={() => navigateToLand('next')}
                                    disabled={currentLandIndex === lands.length - 1}
                                    title="Next land"
                                >
                                    Next Land 👉
                                </button>
                            </div>
                        )}
                    </div>
                    {lands.length > 1 && (
                        <div className="land-info-text">
                            <p>📋 You have {lands.length} lands. Use the buttons above to navigate between lands and fill in the details for each one.</p>
                            <p>Each land will create a separate mission. 📋</p>
                        </div>
                    )}
                    <SearchableAscDropdown
                        value={getCurrentLandFormData().ascCenter || ""}
                        onChange={(selectedAscId) => {
                            updateLandFormData(lands[currentLandIndex]?.id, 'ascCenter', selectedAscId);
                            // Reset GND when ASC changes for this land
                            updateLandFormData(lands[currentLandIndex]?.id, 'gndCenter', "");
                        }}
                        options={ascOptions}
                        isLoading={isLoadingAsc}
                        error={ascError}
                        placeholder="Select ASC Center"
                        disabled={isLoadingAsc || !!ascError}
                    />

                    {getCurrentLandFormData().ascCenter && (() => {
                        const currentAsc = ascOptions.find(asc => asc.asc_id === parseInt(getCurrentLandFormData().ascCenter));
                        const currentGndOptions = currentAsc?.gnds || [];
                        return currentGndOptions.length > 0 ? (
                            <div className="floating-label-input">
                                <select
                                    id={`gndCenter-${lands[currentLandIndex]?.id}`}
                                    value={getCurrentLandFormData().gndCenter || ""}
                                    onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'gndCenter', e.target.value)}
                                    className="input-floating"
                                    disabled={isLoadingGnd || !!gndError}
                                >
                                    <option value="">Select GND (Grama Niladhari Division)</option>
                                    {currentGndOptions.map(option => (
                                        <option key={option.id} value={`${option.id}`}>
                                            {option.gnd}
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor={`gndCenter-${lands[currentLandIndex]?.id}`} className="label-floating">
                                    Select GND (Grama Niladhari Division) for {lands[currentLandIndex]?.landName}
                                    <span className="red-star"> *</span>
                                </label>
                            </div>
                        ) : null;
                    })()}
                    <div className="floating-label-input">
                        <select
                            id={`sector-${lands[currentLandIndex]?.id}`}
                            value={getCurrentLandFormData().sector || ""}
                            onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'sector', e.target.value)}
                            className="input-floating"
                            disabled={isLoadingSectors || !!sectorError}
                        >
                            <option value="">Select Sector</option>
                            {isLoadingSectors ? (
                                <option disabled>Loading sectors...</option>
                            ) : sectorError ? (
                                <option disabled>Error loading sectors: {sectorError}</option>
                            ) : (
                                sectorOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.sector}
                                    </option>
                                ))
                            )}
                        </select>
                        <label htmlFor={`sector-${lands[currentLandIndex]?.id}`} className="label-floating">
                            Select Sector for {lands[currentLandIndex]?.landName}
                            <span className="red-star"> *</span>
                        </label>
                    </div>
                    {/* Crop Type and Mission Type Row */}
                    <div className="form-row">
                        <div className="floating-label-input">
                            <select
                                id={`cropTypes-${lands[currentLandIndex]?.id}`}
                                value={getCurrentLandFormData().cropType || ""}
                                onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'cropType', e.target.value)}
                                className="input-floating"
                                disabled={isLoadingCrops || !!cropError}
                            >
                                <option value="">Select Crop Type</option>
                                {isLoadingCrops ? (
                                    <option disabled>Loading crops...</option>
                                ) : cropError ? (
                                    <option disabled>Error loading crops: {cropError}</option>
                                ) : (
                                    cropOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.crop}
                                        </option>
                                    ))
                                )}
                            </select>
                            <label htmlFor={`cropTypes-${lands[currentLandIndex]?.id}`} className="label-floating">
                                Select Crop Type for {lands[currentLandIndex]?.landName}
                                <span className="red-star"> *</span>
                            </label>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="floating-label-input">
                            <select
                                id={`missionTypes-${lands[currentLandIndex]?.id}`}
                                value={getCurrentLandFormData().missionType || ""}
                                onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'missionType', e.target.value)}
                                className="input-floating"
                                disabled={isLoadingMissions || !!missionError}
                            >
                                <option value="">Select Mission Type</option>
                                {isLoadingMissions ? (
                                    <option disabled>Loading missions...</option>
                                ) : missionError ? (
                                    <option disabled>Error loading missions: {missionError}</option>
                                ) : (
                                    missionOptions.map(option => (
                                        <option key={option.mission_type_code} value={option.mission_type_code}>
                                            {option.mission_type_name}
                                        </option>
                                    ))
                                )}
                            </select>
                            <label htmlFor={`missionTypes-${lands[currentLandIndex]?.id}`} className="label-floating">
                                Select Mission Type for {lands[currentLandIndex]?.landName}
                                <span className="red-star"> *</span>
                            </label>
                        </div>
                    </div>

                    {/* Agro Chemical and Units Row */}
                    <div className="form-row">
                        <div className="floating-label-input">
                            <select
                                id={`agroChemical-${lands[currentLandIndex]?.id}`}
                                value={getCurrentLandFormData().agroChemical || ""}
                                onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'agroChemical', e.target.value)}
                                className="input-floating"
                                disabled={isLoadingChemicals || !!chemicalError}
                            >
                                                                 <option value="">{getCurrentLandFormData().missionType ? 'Select Agro Chemical' : 'Please select Mission Type first'}</option>
                                {isLoadingChemicals ? (
                                    <option disabled>Loading chemicals...</option>
                                ) : (() => {
                                                                        const currentMissionType = getCurrentLandFormData().missionType;
                                    
                                    // Ensure we have a proper array of chemicals
                                    let filteredChemicals = Array.isArray(chemicalOptions) ? chemicalOptions : [];
                                    
                                    // If chemicals is still nested, try to flatten it
                                    if (filteredChemicals.length === 1 && Array.isArray(filteredChemicals[0])) {
                                        filteredChemicals = filteredChemicals[0];
                                    }
                                    
                                    // Filter chemicals based on mission type
                                    if (currentMissionType) {
                                        // Create a mapping between mission types and chemical categories
                                        const missionToChemicalMapping = {
                                            "spy": ["spy"], // Spraying mission shows spy chemicals
                                            "spd": ["spd"], // Spreading mission shows spd chemicals  
                                            "sct": ["spy", "spd"] // SCT mission shows both types
                                        };
                                        
                                        const allowedCategories = missionToChemicalMapping[currentMissionType] || [];
                                        
                                        filteredChemicals = filteredChemicals.filter(chemical => {
                                            const isAllowed = allowedCategories.includes(chemical.category);
                                            return isAllowed;
                                        });
                                    }
                                     
                                     if (filteredChemicals.length === 0) {
                                         if (currentMissionType) {
                                             return <option disabled>No chemicals available for mission type "{currentMissionType}"</option>;
                                         } else {
                                             return <option disabled>Please select a mission type first</option>;
                                         }
                                     }
                                     
                                     return filteredChemicals.map(option => (
                                         <option key={option.id} value={option.id}>
                                             {option.chemical} ({option.category})
                                         </option>
                                     ));
                                })()}
                            </select>
                            <label htmlFor={`agroChemical-${lands[currentLandIndex]?.id}`} className="label-floating">
                                Select Agro Chemical for {lands[currentLandIndex]?.landName}
                                <span className="red-star"> *</span>
                            </label>
                        </div>

                        <div className="floating-label-input">
                            <input
                                type="text"
                                id={`units-${lands[currentLandIndex]?.id}`}
                                value={getCurrentLandFormData().units || ""}
                                onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'units', e.target.value)}
                                className="input-floating"
                                placeholder=""
                            />
                            <label htmlFor={`units-${lands[currentLandIndex]?.id}`} className="label-floating">
                                Units (L/KG) for {lands[currentLandIndex]?.landName}
                            </label>
                        </div>
                    </div>

                    {/* Needed Water */}
                    <div className="floating-label-input">
                        <input
                            type="text"
                            id={`neededWater-${lands[currentLandIndex]?.id}`}
                            inputMode="decimal"
                            value={getCurrentLandFormData().neededWater || ""}
                            onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'neededWater', e.target.value)}
                            className="input-floating"
                            placeholder="Liters"
                            title="Enter water quantity in numbers"
                        />
                        <label htmlFor={`neededWater-${lands[currentLandIndex]?.id}`} className="label-floating">
                            Needed Water (Liters) for {lands[currentLandIndex]?.landName}
                            <span className="red-star"> *</span>
                        </label>
                        <span className="red-star">8 litters per Acre</span>
                    </div>

                    {/* Date and Time Row */}
                    <div className="form-row">
                        <div className="floating-label-input">
                            <input
                                type="date"
                                id={`date-${lands[currentLandIndex]?.id}`}
                                value={getCurrentLandFormData().selectedDate || ""}
                                onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'selectedDate', e.target.value)}
                                className="input-floating"
                            />
                            <label htmlFor={`date-${lands[currentLandIndex]?.id}`} className="label-floating">
                                Pick a Date for {lands[currentLandIndex]?.landName}
                                <span className="red-star"> *</span>
                            </label>
                        </div>

                        <div className="floating-label-input">
                            <select
                                id={`time-${lands[currentLandIndex]?.id}`}
                                value={getCurrentLandFormData().selectedTime || ""}
                                onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'selectedTime', e.target.value)}
                                className="input-floating"
                                disabled={isLoadingTimes || !!timeError}
                            >
                                <option value=""></option>
                                {isLoadingTimes ? (
                                    <option disabled>Loading time slots...</option>
                                ) : timeError ? (
                                    <option disabled>Error loading times: {timeError}</option>
                                ) : (
                                    timeOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.time_of_day}
                                        </option>
                                    ))
                                )}
                            </select>
                            <label htmlFor={`time-${lands[currentLandIndex]?.id}`} className="label-floating">
                                Pick a Time for {lands[currentLandIndex]?.landName}
                                <span className="red-star"> *</span>
                            </label>
                        </div>
                    </div>

                    {/* Stage */}
                    <div className="floating-label-input">
                        <select
                            id={`stage-${lands[currentLandIndex]?.id}`}
                            value={getCurrentLandFormData().stage || ""}
                            onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'stage', e.target.value)}
                            className="input-floating"
                            disabled={isLoadingStages || !!stageError}
                        >
                            <option value=""></option>
                            {isLoadingStages ? (
                                <option disabled>Loading stages...</option>
                            ) : stageError ? (
                                <option disabled>Error loading stages: {stageError}</option>
                            ) : (
                                stageOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.level}
                                    </option>
                                ))
                            )}
                        </select>
                        <label htmlFor={`stage-${lands[currentLandIndex]?.id}`} className="label-floating">
                            Select Stage for {lands[currentLandIndex]?.landName}
                            <span className="red-star"> *</span>
                        </label>
                    </div>

                    {/* Chemical Provided Checkbox */}
                    <div className="checkbox-container">
                        <label>
                            <input
                                type="checkbox"
                                checked={getCurrentLandFormData().chemicalProvided || false}
                                onChange={(e) => updateLandFormData(lands[currentLandIndex]?.id, 'chemicalProvided', e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span>Chemical Provided</span>
                        </label>
                    </div>



                    {/* Progress Indicator */}
                    {lands.length > 1 && (
                        <div className="progress-indicator">
                            <div className="progress-text">
                                <span>Progress: {lands.filter(land => {
                                    const landData = landFormData[land.id];
                                    return land.landName && land.extent && 
                                           landData?.ascCenter && landData?.gndCenter &&
                                           landData?.sector && landData?.cropType && 
                                           landData?.missionType && landData?.stage && 
                                           landData?.agroChemical && landData?.neededWater && 
                                           landData?.selectedDate && landData?.selectedTime;
                                }).length} of {lands.length} lands completed</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{
                                        width: `${(lands.filter(land => {
                                            const landData = landFormData[land.id];
                                            return land.landName && land.extent && 
                                                   landData?.ascCenter && landData?.gndCenter &&
                                                   landData?.sector && landData?.cropType && 
                                                   landData?.missionType && landData?.stage && 
                                                   landData?.agroChemical && landData?.neededWater && 
                                                   landData?.selectedDate && landData?.selectedTime;
                                        }).length / lands.length) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <div
                        className={`button-class ${isSubmitting ? 'disabled' : ''}`}
                        onClick={!isSubmitting ? handleSubmit : undefined}
                    >
                        <div className="button-container">
                            <div className="button-background" />
                            <div className="button-text">
                                {isSubmitting ? (
                                    <Bars
                                        height="20"
                                        width="50"
                                        color="#ffffff"
                                        ariaLabel="bars-loading"
                                        visible={true}
                                    />
                                ) : (
                                    lands.length > 1 ? `Create ${lands.length} Missions` : "Create a Mission"
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {showHistoryPopup && (
                <div className="popup-overlay-ascbooking-window" onClick={() => setShowHistoryPopup(false)}>
                    <div className="popup-content-ascbooking-window" onClick={(e) => e.stopPropagation()}>
                        {/* Header with close button */}
                        <div className="history-popup-header">
                            <h3 className="history-popup-title">
                                📋 Recent Lands
                            </h3>
                            <button 
                                className="history-popup-close-btn"
                                onClick={() => setShowHistoryPopup(false)}
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {previousLands.length === 0 ? (
                            <div className="history-popup-empty">
                                📭 No previous lands found
                            </div>
                        ) : (
                            <div className="history-popup-grid">
                                {previousLands.map((l, idx) => (
                                    <div key={idx} className="history-land-card">
                                        {/* Land ID Badge */}
                                        <div className="history-land-badge">
                                            ID: {l.id}
                                        </div>

                                        <div className="history-land-title">
                                            🏞️ {l.land_name || 'Unnamed land'}
                                        </div>
                                        
                                        <div className="history-land-details">
                                            <div className="history-land-detail-item">
                                                <span className="history-land-icon">📍</span>
                                                <span>{l.land_address}</span>
                                            </div>
                                            <div className="history-land-detail-item">
                                                <span className="history-land-icon">📏</span>
                                                <span>{l.land_extent} Acre</span>
                                            </div>
                                            <div className="history-land-detail-item">
                                                <span className="history-land-icon">🏢</span>
                                                <span>{l.asc_name} (#{l.asc})</span>
                                            </div>
                                            <div className="history-land-detail-item">
                                                <span className="history-land-icon">🏘️</span>
                                                <span>{l.gnd_name} (#{l.gnd})</span>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            className="history-apply-btn"
                                            onClick={() => applyPreviousLandToCurrent(l)}
                                        >
                                            ✅ Apply to Current Land
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AscBookings;
