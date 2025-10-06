import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import '../styles/css-navbar.css';

const TopNavBar = (props) => {
  const [activeUser, setActiveUser] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('userData'));

    if (storedUser) {
      setActiveUser(storedUser.member_type_name);
      setProfileImage(storedUser.image);
    }
  }, []);

  // Define navbar color based on user role
  let topNavColor = '';
  switch (activeUser) {
    case 'Internal User':
      topNavColor = 'darkblue';
      break;
    case 'manager':
      topNavColor = 'green';
      break;
    case 'pilot':
      topNavColor = 'blue';
      break;
    default:
      topNavColor = 'gray';
  }
  return (
    <div className={`top-nav ${topNavColor} mobile-only`}>
      <button className="hamburger" onClick={props.onMenuClick} aria-label="Open menu">
        &#9776;
      </button>
      {/* Removed left-empty div to keep hamburger on the left */}
      <div className="profile-icon">
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="profile-pic" />
        ) : (
          <FaUserCircle className="profile-pic" />
        )}
      </div>
    </div>
  );
};

export default TopNavBar;
