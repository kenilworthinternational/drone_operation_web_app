import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyUserThunk, sendOTPThunk, loginUserThunk, clearError } from '../store/slices/authSlice';
import '../styles/login.css';
import { logger } from '../utils/logger';
import LiquidEther from '../UI/LiquidEther';
const Login = () => {
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const navigate = useNavigate();

  // Navigate to home if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home/create');
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;

    // Allow only digits
    if (!/^\d*$/.test(value)) return;

    // Prevent 0 as the first digit
    if (value.length === 1 && value[0] === '0') return;

    // Max length 9
    if (value.length <= 9) {
      setPhoneNumber(value);
      dispatch(clearError()); // Clear error on valid input
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

    dispatch(clearError());
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
      // Error will be shown via Redux error state
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
      return;
    }

    dispatch(clearError());

    // Verify user exists
    const verifyResult = await dispatch(verifyUserThunk(phoneNumber));

    if (verifyUserThunk.fulfilled.match(verifyResult)) {
      // Generate OTP
      const otpCode = generateOTP();
      setGeneratedOTP(otpCode);
      logger.log('🔐 Generated OTP:', otpCode);
      logger.log('📱 Phone Number:', phoneNumber);

      // Send OTP
      const sendResult = await dispatch(sendOTPThunk({ phoneNumber, otpCode }));

      if (sendOTPThunk.fulfilled.match(sendResult)) {
        setShowOTPInput(true);
      }
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('').trim();

    logger.log('🔍 OTP Submit Debug:');
    logger.log('  - Entered OTP:', otpString);
    logger.log('  - Generated OTP:', generatedOTP);

    if (otpString.length !== 6) {
      logger.log('❌ OTP length validation failed');
      return;
    }

    // Check if generatedOTP exists
    if (!generatedOTP) {
      logger.log('❌ Generated OTP is missing/empty');
      setShowOTPInput(false);
      setOtp(['', '', '', '', '', '']);
      return;
    }

    // Verify OTP matches the generated OTP (compare as strings)
    const enteredOTPStr = String(otpString);
    const generatedOTPStr = String(generatedOTP);

    if (enteredOTPStr !== generatedOTPStr) {
      logger.log('❌ OTP mismatch - validation failed');
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

    logger.log('✅ OTP validation passed');
    dispatch(clearError());

    // Login user after OTP verification
    logger.log('🔐 Calling loginUser API with phone:', phoneNumber);
    const loginResult = await dispatch(loginUserThunk(phoneNumber));

    if (loginUserThunk.fulfilled.match(loginResult)) {
      logger.log('✅ Login successful');
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } else {
      logger.log('❌ Login failed');
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    dispatch(clearError());

    // Generate new OTP
    const otpCode = generateOTP();
    setGeneratedOTP(otpCode);
    logger.log('🔄 Resent OTP:', otpCode);
    // Clear previous OTP input
    setOtp(['', '', '', '', '', '']);

    // Send OTP
    const sendResult = await dispatch(sendOTPThunk({ phoneNumber, otpCode }));

    if (sendOTPThunk.fulfilled.match(sendResult)) {
      // Reset timer
      setResendTimer(60);
    } else {
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
    dispatch(clearError());
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <LiquidEther
        />
      </div>
      <div className="login-content">
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
                    disabled={loading}
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
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
                      disabled={loading}
                      autoFocus={index === 0 && otp[0] === ''}
                      className={`otp-input ${error && error.includes('Invalid OTP') ? 'otp-error' : ''}`}
                    />
                  ))}
                </div>
                <div className="resend-otp-container">
                  {canResend ? (
                    <button
                      type="button"
                      className="resend-otp-btn"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      <span className="resend-icon">↻</span>
                      {loading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  ) : (
                    <div className="resend-timer-wrapper">
                      <span className="timer-icon">⏱</span>
                      <span className="resend-timer">
                        Resend OTP in <strong>{resendTimer}s</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="submit-btn back-btn" onClick={handleBackToPhone} disabled={loading}>
                  Back
                </button>
                <button type="submit" className="submit-btn verify-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;