import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaServicestack, FaBookOpen, FaCalendar, FaStreetView } from 'react-icons/fa';
import '../css/css-navbar.css';

const LeftNavBar = () => {
  const [activeLink, setActiveLink] = useState('/home/dashboard');
  const userType = 'pilot';
  const companyName = 'kenilworth';

  let companyLogo = '';
  let navbarColor = '';

  switch (companyName) {
    case 'kenilworth':
      companyLogo = '../assets/images/kenilworth.png';
      break;
    case 'kelanivalley':
      companyLogo = '../assets/images/kelanivalley.png';
      break;
    case 'ops':
      companyLogo = 'kenilworth.png';
      break;
    default:
      companyLogo = 'gray.png';
  }

  switch (userType) {
    case 'pilot':
      navbarColor = 'blue';
      break;
    case 'manager':
      navbarColor = 'green';
      break;
    case 'ops':
      navbarColor = 'darkblue';
      break;
    default:
      navbarColor = 'gray';
  }

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  return (
    <div className={`left-nav ${navbarColor}`}>
      <div className="logo">
        <img src={companyLogo} alt="Logo" />
      </div>
      {/* <h3>Menu Items</h3> */}
      <ul>
        <li>
          <Link
            to="/home/dashboard"
            className={`nav-link ${activeLink === '/home/dashboard' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/home/dashboard')}
          >
            <FaHome className="nav-icon" /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/home/services"
            className={`nav-link ${activeLink === '/home/services' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/home/services')}
          >
            <FaServicestack className="nav-icon" /> Services
          </Link>
        </li>
        <li>
          <Link
            to="/home/proceedPlan"
            className={`nav-link ${activeLink === '/home/proceedPlan' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/home/proceedPlan')}
          >
            <FaBookOpen className="nav-icon" /> Resources Plan
          </Link>
        </li>
        <li>
          <Link
            to="/home/summeryView"
            className={`nav-link ${activeLink === '/home/summeryView' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/home/summeryView')}
          >
            <FaStreetView className="nav-icon" /> Summary View
          </Link>
        </li>
        <li>
          <Link
            to="/home/calenderView"
            className={`nav-link ${activeLink === '/home/calenderView' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/home/calenderView')}
          >
            <FaCalendar className="nav-icon" /> Calender View
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default LeftNavBar;
