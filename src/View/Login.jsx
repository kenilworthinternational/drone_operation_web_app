import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';
import useOTPService from '../Controller/auth_otp/otp_services';
import { verifyUser, loginUser } from '../Controller/api/api';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const { isLoading, isVerified, sendOTP, verifyOTP } = useOTPService();

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;
    if (value.length <= 9) {
      setPhoneNumber(value);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 9) {
      setErrorMessage('Phone number must be 9 digits.');
      return;
    }
    try {
      const userData = await verifyUser(phoneNumber);
      console.log('User Data:', userData);
      
      if (userData?.status === 'true') {  // Explicitly check for true status
        await sendOTP(`94${phoneNumber}`);
        setOtpSent(true);
        setErrorMessage('');
        startTimer();
      } else {
        setErrorMessage('Not a verified user.');
      }
    } catch (error) {
      setErrorMessage('Verification failed. Try again later.');
    }
  };
  

  const handleOTPChange = (index, event) => {
    const value = event.target.value;
    if (!/\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const enteredOTP = otp.join('');
    if (enteredOTP.length === 4) {
      verifyOTP(enteredOTP);
    }
  };

  const startTimer = () => {
    setTimerActive(true);
    setCountdown(60);
  };

  useEffect(() => {
    let interval;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  useEffect(() => {
    if (isVerified) {
      loginUser(phoneNumber)
        .then((response) => {
          if (response?.login_status) {
            // Save user data in localStorage (or sessionStorage)
            localStorage.setItem('userData', JSON.stringify(response));

            // Redirect to home page
            navigate('/home');
          }
        })
        .catch(console.error);
    }
  }, [isVerified, navigate, phoneNumber]);


  return (
    <div className="login-container">
      <div className="left-side">
        <img src="../assets/images/AgrasT20P.webp" alt="Drone" className="drone-img" />
      </div>
      <div className="right-side">
        <div className="login-box">
          <div className="logo-container">
            <img src="../assets/images/kenilowrthlogoDark.png" alt="Logo" className="logo" />
            <h1 className="project-name">Drone Services Management System</h1>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOTP}>
              <div className="phone-number-input">
                <label htmlFor="phone-number">Mobile Number</label>
                <div className="input-container">
                  <span className="country-code">+94</span>
                  <input type="text" id="phone-number" value={phoneNumber} onChange={handlePhoneNumberChange} maxLength="9" required />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? 'Sending OTP...' : 'Next'}</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="phone-number-input">
                <label htmlFor="otp">Enter OTP</label>
                <div className="otp-boxes">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e)}
                      maxLength="1"
                      ref={inputRefs[index]}
                      className="otp-input"
                      required
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="submit-btn">Verify OTP</button>
            </form>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {isVerified && <p className="success-message">OTP Verified Successfully! Redirecting...</p>}

          {otpSent && timerActive && <p className="countdown">Resend OTP in {countdown}s</p>}
          {!timerActive && otpSent && !isVerified && <button className="resend-btn" onClick={handleSendOTP}>Resend OTP</button>}
        </div>
      </div>
    </div>
  );
};

export default Login;
