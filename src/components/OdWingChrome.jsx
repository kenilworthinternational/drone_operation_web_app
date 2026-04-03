import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/combHub.css';
import { FaArrowLeft } from 'react-icons/fa';

/**
 * Minimal shell when viewing OD wing workflow: back to hub only (no left nav, no extra tabs).
 */
const OdWingChrome = () => (
  <header className="comb-chrome">
    <Link to="/home" className="comb-chrome-back" title="Back to hub">
      <FaArrowLeft aria-hidden />
      <span>Back to hub</span>
    </Link>
  </header>
);

export default OdWingChrome;
