import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import '../css/css-navbar.css';

const TopNavBar = () => {
  const [activeUser, setActiveUser] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('userData'));

    if (storedUser) {
      setActiveUser(storedUser.job_role);
      setProfileImage(storedUser.image);
    }
  }, []);

  // Define navbar color based on user role
  let topNavColor = '';
  switch (activeUser) {
    case 'pilot':
      topNavColor = 'blue';
      break;
    case 'manager':
      topNavColor = 'green';
      break;
    case 'ops':
      topNavColor = 'darkblue';
      break;
    default:
      topNavColor = 'gray';  // Default color
  }

  return (
    <div className={`top-nav ${topNavColor}`}>
      <div className="left-empty"></div> {/* Empty space on the left */}
      <h1 className="project-name">Drone Services Management System</h1> {/* Project Name */}
      
      <div className="profile-icon">
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="profile-pic" /> // Use stored image
        ) : (
          <FaUserCircle className="profile-pic" /> // Default icon if no image
        )}
      </div>
    </div>
  );
};

export default TopNavBar;
