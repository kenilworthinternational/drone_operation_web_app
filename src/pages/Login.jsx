import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { verifyUser, loginUser, sendOTP, verifyOTPAndLogin } from '../api/api';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
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

  const handleOtpChange = (index, value) => {
    // Allow only digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    
    // Update current input
    if (value.length === 1) {
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (value.length === 0) {
      newOtp[index] = '';
      setOtp(newOtp);
    }
    
    setErrorMessage('');
  };

  const handleOtpKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (!/^\d{6}$/.test(pastedData)) {
      setErrorMessage('Invalid OTP format');
      return;
    }
    
    const otpArray = pastedData.split('');
    setOtp(otpArray);
    
    // Focus last input
    const lastInput = document.getElementById('otp-5');
    if (lastInput) {
      lastInput.focus();
    }
  };

  // Generate 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 9) {
      setErrorMessage('Phone number must be 9 digits.');
      return;
    }

    try {
      setSendingOTP(true);
      setErrorMessage('');
      
      // Verify user exists
      const userData = await verifyUser(phoneNumber);
      console.log('User Data:', userData);

      if (userData?.status === 'true') {
        // Generate OTP
        const otpCode = generateOTP();
        setGeneratedOTP(otpCode);
        
        // Send OTP
        const sendResult = await sendOTP(phoneNumber, otpCode);
        
        if (sendResult?.status === 'true') {
          setShowOTPInput(true);
          setSendingOTP(false);
        } else {
          setErrorMessage('Failed to send OTP. Please try again.');
          setSendingOTP(false);
        }
      } else {
        setErrorMessage('Not a verified user.');
        setSendingOTP(false);
      }
    } catch (error) {
      setErrorMessage('Login failed. Please try again later.');
      console.error('Login error:', error);
      setSendingOTP(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setErrorMessage('OTP must be 6 digits.');
      return;
    }

    if (otpString !== generatedOTP) {
      setErrorMessage('Invalid OTP. Please try again.');
      // Clear OTP and refocus first input
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
      return;
    }

    try {
      setVerifyingOTP(true);
      setErrorMessage('');
      
      // Verify OTP matches and login
      const response = await verifyOTPAndLogin(phoneNumber, otpString);
      
      if (response?.success && response?.userData) {
        localStorage.setItem('userData', JSON.stringify(response.userData));
        console.log('Login successful, user data:', response.userData);
        navigate('/home');
      } else {
        setErrorMessage('Login failed. Please try again.');
        setVerifyingOTP(false);
      }
    } catch (error) {
      setErrorMessage('Login failed. Please try again later.');
      console.error('Login error:', error);
      setVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setSendingOTP(true);
      setErrorMessage('');
      setCanResend(false);
      
      // Generate new OTP
      const otpCode = generateOTP();
      setGeneratedOTP(otpCode);
      
      // Clear previous OTP input
      setOtp(['', '', '', '', '', '']);
      
      // Send OTP
      const sendResult = await sendOTP(phoneNumber, otpCode);
      
      if (sendResult?.status === 'true') {
        setErrorMessage(''); // Clear any previous errors
        // Reset timer
        setResendTimer(60);
      } else {
        setErrorMessage('Failed to send OTP. Please try again.');
        setCanResend(true);
      }
      setSendingOTP(false);
    } catch (error) {
      setErrorMessage('Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', error);
      setSendingOTP(false);
      setCanResend(true);
    }
  };

  useEffect(() => {
    let timerInterval;
    
    if (showOTPInput && resendTimer > 0) {
      timerInterval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [showOTPInput, resendTimer]);

  const handleBackToPhone = () => {
    setShowOTPInput(false);
    setOtp(['', '', '', '', '', '']);
    setGeneratedOTP('');
    setErrorMessage('');
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

          {!showOTPInput ? (
            <form onSubmit={handlePhoneSubmit}>
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
                    disabled={sendingOTP}
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={sendingOTP}>
                {sendingOTP ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit}>
              <div className="phone-number-input">
                <label>Enter OTP</label>
                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      id={`otp-${index}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      maxLength="1"
                      required
                      disabled={verifyingOTP}
                      autoFocus={index === 0 && otp[0] === ''}
                      className={`otp-input ${errorMessage && errorMessage.includes('Invalid OTP') ? 'otp-error' : ''}`}
                    />
                  ))}
                </div>
                <div className="resend-otp-container">
                  {canResend ? (
                    <button 
                      type="button" 
                      className="resend-otp-btn" 
                      onClick={handleResendOTP}
                      disabled={sendingOTP}
                    >
                      {sendingOTP ? 'Sending...' : 'Resend OTP'}
                    </button>
                  ) : (
                    <p className="resend-timer">
                      Resend OTP in {resendTimer}s
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="submit-btn back-btn" onClick={handleBackToPhone} disabled={verifyingOTP || sendingOTP}>
                  Back
                </button>
                <button type="submit" className="submit-btn verify-btn" disabled={verifyingOTP || sendingOTP}>
                  {verifyingOTP ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;