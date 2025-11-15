import React, { useState, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { baseApi } from '../../api/services/allEndpoints';
import { useAppDispatch } from '../../store/hooks';
import { Bars } from "react-loader-spinner";
import "../../styles/pilotmappingdetails.css";

const PilotMappingDetails = ({ estateIds, startDate, endDate }) => {
    const dispatch = useAppDispatch();
    const [pilotData, setPilotData] = useState([]);
    const [expandedPilot, setExpandedPilot] = useState(null);
    const [expandedPlan, setExpandedPlan] = useState(null);
    const [subtaskData, setSubtaskData] = useState(null);
    const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPilotData = async () => {
            try {
                if (!estateIds?.length || !startDate || !endDate) return;
                setLoading(true);
                const formattedEstates = estateIds.map(id => String(id));
                console.log("blalalala", startDate, endDate, formattedEstates);
                const result = await dispatch(baseApi.endpoints.getPilotPlansAndSubtasks.initiate({ startDate, endDate, estates: formattedEstates }));
                const response = result.data;
                console.log("######", response);
                if (response?.success) {
                    setPilotData(response.data);
                } else {
                    setError(response?.message || "API Error");
                }
            } catch (err) {
                setError("Server Error (500)");
            } finally {
                setLoading(false);
            }
        };

        fetchPilotData();
    }, [estateIds, startDate, endDate]);

    const handleSubtaskClick = async (taskId) => {
        try {
            const result = await dispatch(baseApi.endpoints.getSubmissionData.initiate(taskId));
            const response = result.data;
            if (response?.status === "true") {
                setSubtaskData(Object.values(response).filter(item => typeof item === "object"));
                setIsSubtaskModalOpen(true);
            } else {
                setError("Failed to load subtask data.");
            }
        } catch (err) {
            setError("Error fetching subtask data.");
        }
    };

    const openFullScreenImage = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsImageOpen(true);
    };

    return (
        <div className="pilot-mapping-container">
            {error && <div className="error">{error}</div>}

            {loading ? (
                <div className="loading-container">
                    <Bars
                        height="300"
                        width="300"
                        color="#004B71"
                        ariaLabel="loading-indicator"
                    />
                </div>
            ) : (
                <>
                    {pilotData.map((pilot) => (
                        <div key={pilot.pilot_id} className="pilot-card-details">
                            <div className="pilot-header">
                                <div className="left-set-area">
                                    <img
                                        src={pilot.image} // Assuming pilot.profile_image contains the URL
                                        alt="Profile"
                                        className="profile-image-mapping"
                                    /><span>
                                        {pilot.pilot_name}{' '} | {' '}{pilot.pilot_mobile_no} {' '}| {' '}Total :{' '}
                                        {pilot.plans.reduce((sum, plan) => sum + plan.field_area, 0).toFixed(2)} Ha
                                    </span>
                                </div>
                                <div className="right-set-area">
                                    <IconButton onClick={() => setExpandedPilot(expandedPilot === pilot.pilot_id ? null : pilot.pilot_id)}>
                                        {expandedPilot === pilot.pilot_id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </div>
                            </div>



                            {expandedPilot === pilot.pilot_id && (
                                <div className="plans-container">
                                    {pilot.plans
                                        .sort((a, b) => new Date(a.plan_date) - new Date(b.plan_date))
                                        .map((plan) => (
                                            <div key={plan.plan_id} className="plan-card">
                                                <div className="plan-header">
                                                    <span>
                                                        {plan.estate_name} - {plan.field_area} Ha | {plan.plan_date}
                                                    </span>
                                                    <IconButton onClick={() => setExpandedPlan(expandedPlan === plan.plan_id ? null : plan.plan_id)}>
                                                        {expandedPlan === plan.plan_id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    </IconButton>
                                                </div>
                                                {expandedPlan === plan.plan_id && (
                                                    <ul className="tasks-list">
                                                        {plan.tasks.map((task) => (
                                                            <li key={task.id} className="task-item">
                                                                <div className="task-info">
                                                                    <span className={`field-name ${task.final_status === "c" ? "completed-task" : task.final_status === "x" ? "not-sprayed-task" : task.final_status === "o" ? "ongoing-task" : task.final_status === "p" ? "pending-task" : task.final_status === null ? "incomplete-task" : ""}`}>
                                                                        {task.field_short_name} {'  '}
                                                                        {task.final_status === "c"
                                                                            ? "Completed"
                                                                            : task.final_status === "x"
                                                                                ? "Canceled"
                                                                                : task.final_status === "o"
                                                                                    ? "Ongoing"
                                                                                    : task.final_status === "p"
                                                                                        ? "Pending"
                                                                                        : "Status Not Available"}
                                                                    </span>
                                                                    <div className="task-details-view">
                                                                        <div className="first-col-map-details">
                                                                            <span>Crop: {plan.crop_type_text}</span>
                                                                            <span>Mission: {plan.mission_type_name}</span>

                                                                            <span>Drone: {task.drone_tag}</span>
                                                                            <span>Sprayed Time: {task.time_of_day_name}</span>

                                                                        </div>
                                                                        <div className="second-col-map-details">
                                                                            <span>Area: {task.field_area} Ha</span>
                                                                            <span>Sprayed: {task.sprayed_area} Ha</span>
                                                                            <span>Liters: {task.sprayed_liters} L</span>
                                                                            <span>Chemical Used:</span>
                                                                            {task.chemicals && task.chemicals.length > 0 ? (
                                                                                <ul>
                                                                                    {task.chemicals.map((chemical, index) => (
                                                                                        <li key={index}>
                                                                                            {chemical.chemical_name} (Quantity: {chemical.quantity} KG)
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            ) : (
                                                                                <span>N/A</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="third-col-map-details">
                                                                            {task.image && (
                                                                                <img
                                                                                    src={task.image}
                                                                                    alt="Field preview"
                                                                                    className="field-image-thumbnail"
                                                                                    onClick={() => openFullScreenImage(task.image)}
                                                                                />
                                                                            )}
                                                                            <Button
                                                                                onClick={() => handleSubtaskClick(task.id)}
                                                                                disabled={task.field_area === 0} // Disable button if field_area is 0
                                                                            >
                                                                                Subtasks
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}

            {/* Subtask Popup */}
            <Dialog open={isSubtaskModalOpen} onClose={() => setIsSubtaskModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Subtask Details
                    <IconButton onClick={() => setIsSubtaskModalOpen(false)} style={{ position: "absolute", right: 10, top: 10 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {subtaskData?.length ? (
                        <ul className="subtask-list">
                            {subtaskData.map((task, index) => (
                                <li key={index} className="subtask-item">
                                    <div className="subtask-set-details">
                                        <div className="detail-col">
                                            <strong>Task ID:</strong> {task.id} <br />
                                            <strong>Status:</strong> {task.taskStatus === "c" ? "Completed" : "Partially Complete"} <br />
                                            <strong>Field Area:</strong> {task.fieldArea} Ha <br />
                                            <strong>Sprayed Area:</strong> {task.sprayedArea} Ha <br />
                                            <strong>Liters Used:</strong> {task.sprayedLiters} L <br />
                                            <strong>Manual/Auto:</strong> {task.isManual === "m" ? "Manual" : "Automatic"} <br />
                                        </div>
                                        <div className="image-col">
                                            {task.image && (
                                                <img
                                                    src={task.image}
                                                    alt="Subtask Preview"
                                                    className="subtask-image"
                                                    onClick={() => openFullScreenImage(task.image)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No subtask data available.</p>
                    )}
                </DialogContent>
            </Dialog>

            {/* Full-Screen Image Popup */}
            <Dialog open={isImageOpen} onClose={() => setIsImageOpen(false)} maxWidth="lg" fullWidth>
                <DialogContent style={{ textAlign: "center", background: "#000" }}>
                    <IconButton
                        onClick={() => setIsImageOpen(false)}
                        style={{ position: "absolute", right: 10, top: 10, color: "#fff" }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {selectedImage && <img src={selectedImage} alt="Full Screen" className="full-size-image" />}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PilotMappingDetails;
