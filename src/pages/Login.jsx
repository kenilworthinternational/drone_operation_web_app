import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { verifyUser, loginUser } from '../api/api';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;

    // Allow only digits
    if (!/^\d*$/.test(value)) return;

    // Prevent 0 as the first digit
    if (value.length === 1 && value[0] === '0') return;

    // Max length 9
    if (value.length <= 9) {
      setPhoneNumber(value);
      setErrorMessage(''); // Clear error on valid input
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 9) {
      setErrorMessage('Phone number must be 9 digits.');
      return;
    }

    try {
      const userData = await verifyUser(phoneNumber);
      console.log('User Data:', userData);

      if (userData?.status === 'true') {
        const response = await loginUser(phoneNumber);
        if (response?.login_status) {
          localStorage.setItem('userData', JSON.stringify(response));
          console.log('Login successful, user data:', response);
          navigate('/home');
        } else {
          setErrorMessage('Login failed. Please try again.');
        }
      } else {
        setErrorMessage('Not a verified user.');
      }
    } catch (error) {
      setErrorMessage('Login failed. Please try again later.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <img src="../assets/images/kenilworth.png" alt="Drone" className="drone-img" />
      </div>
      <div className="right-side-login">
        <div className="login-box">
          <div className="logo-container">
            <img src="../assets/images/kenilowrthlogoDark.png" alt="Logo" className="logo" />
            <h1 className="project-name">Drone Services Management System</h1>
          </div>

          <form onSubmit={handleLogin}>
            <div className="phone-number-input">
              <label htmlFor="phone-number">Mobile Number</label>
              <div className="input-container">
                <span className="country-code">+94</span>
                <input
                  type="text"
                  id="phone-number"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  maxLength="9"
                  placeholder="Enter 9-digit number"
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>

          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;