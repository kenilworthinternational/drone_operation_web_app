import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from '../Widgets/TopNavBar';
import LeftNavBar from '../Widgets/LeftNavBar';

import '../css/home.css';
const HomePage = () => {
  return (
    <div>
      <TopNavBar />
      <LeftNavBar />
      <div className="content">
        <Outlet /> {/* This will render Dashboard or Services based on route */}
      </div>
    </div>
  );
};

export default HomePage;
