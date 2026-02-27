import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyUserThunk, sendOTPThunk, loginUserThunk, clearError } from '../store/slices/authSlice';
import '../styles/login.css';
import '../styles/pageWipe.css';
import { logger } from '../utils/logger';
import LiquidEther from '../UI/LiquidEther';
import { useWipeNavigate } from '../utils/useWipeNavigate';

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
  const { wipeNavigate, wipeOverlay } = useWipeNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData.member_type === 'e') {
            navigate('/home/plantation-dashboard');
          } else {
            navigate('/home/create');
          }
        } catch (error) {
          console.error('Error parsing userData:', error);
          navigate('/home/create');
        }
      } else {
        navigate('/home/create');
      }
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    if (value.length === 1 && value[0] === '0') return;
    if (value.length <= 9) {
      setPhoneNumber(value);
      dispatch(clearError());
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    if (value.length === 1) {
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    } else if (value.length === 0) {
      newOtp[index] = '';
      setOtp(newOtp);
    }
    dispatch(clearError());
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;
    const otpArray = pastedData.split('');
    setOtp(otpArray);
    const lastInput = document.getElementById('otp-5');
    if (lastInput) lastInput.focus();
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 9) return;
    dispatch(clearError());
    const verifyResult = await dispatch(verifyUserThunk(phoneNumber));
    if (verifyUserThunk.fulfilled.match(verifyResult)) {
      const otpCode = generateOTP();
      setGeneratedOTP(otpCode);
      logger.log('Generated OTP:', otpCode);
      const sendResult = await dispatch(sendOTPThunk({ phoneNumber, otpCode }));
      if (sendOTPThunk.fulfilled.match(sendResult)) {
        setShowOTPInput(true);
      }
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('').trim();
    if (otpString.length !== 6) return;
    if (!generatedOTP) {
      setShowOTPInput(false);
      setOtp(['', '', '', '', '', '']);
      return;
    }
    if (String(otpString) !== String(generatedOTP)) {
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
      return;
    }
    dispatch(clearError());
    const loginResult = await dispatch(loginUserThunk(phoneNumber));
    if (loginUserThunk.fulfilled.match(loginResult)) {
      logger.log('Login successful');
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    dispatch(clearError());
    const otpCode = generateOTP();
    setGeneratedOTP(otpCode);
    setOtp(['', '', '', '', '', '']);
    const sendResult = await dispatch(sendOTPThunk({ phoneNumber, otpCode }));
    if (sendOTPThunk.fulfilled.match(sendResult)) {
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
          if (prev <= 1) { setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerInterval) clearInterval(timerInterval); };
  }, [showOTPInput, resendTimer]);

  const handleBackToPhone = () => {
    setShowOTPInput(false);
    setOtp(['', '', '', '', '', '']);
    setGeneratedOTP('');
    dispatch(clearError());
  };

  return (
    <div className="login-page">
      {wipeOverlay}
      <div className="login-layout">
        {/* LEFT: Animation + Form */}
        <div className="login-left-panel">
          <div className="login-left-bg"><LiquidEther /></div>
          <div className="login-left-content">
            <div className="login-form-area">
              <div className="login-card">
                <div className="login-card-header">
                  <img src="../assets/images/kenilowrthlogoDark.png" alt="Logo" className="login-card-logo" />
                  <h2 className="login-card-title">Welcome Back</h2>
                  <p className="login-card-subtitle">Sign in to your account</p>
                </div>

                {!showOTPInput ? (
                  <form onSubmit={handlePhoneSubmit} className="login-form">
                    <div className="login-field">
                      <label>Mobile Number <span className="login-required">*</span></label>
                      <div className="login-phone-row">
                        <span className="login-phone-prefix">+94</span>
                        <input
                          type="text"
                          className="login-input"
                          value={phoneNumber}
                          onChange={handlePhoneNumberChange}
                          maxLength="9"
                          placeholder="7XXXXXXXX"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <button type="submit" className="login-btn-primary" disabled={loading || phoneNumber.length !== 9}>
                      {loading ? 'Sending OTP...' : 'SEND OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOTPSubmit} className="login-form">
                    <div className="login-field">
                      <label>Enter the 6-digit OTP sent to +94 {phoneNumber}</label>
                      <div className="login-otp-row">
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
                            className={`login-otp-input ${error && error.includes('Invalid OTP') ? 'login-otp-error' : ''}`}
                          />
                        ))}
                      </div>
                      <div className="login-resend-area">
                        {canResend ? (
                          <button type="button" className="login-resend-btn" onClick={handleResendOTP} disabled={loading}>
                            <span className="login-resend-icon">&#8634;</span>
                            {loading ? 'Sending...' : 'Resend OTP'}
                          </button>
                        ) : (
                          <span className="login-resend-timer">
                            Resend in <strong>{resendTimer}s</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="login-btn-group">
                      <button type="button" className="login-btn-secondary" onClick={handleBackToPhone} disabled={loading}>
                        Back
                      </button>
                      <button type="submit" className="login-btn-primary" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  </form>
                )}

                {error && <p className="login-error-msg">{error}</p>}

                <div className="login-card-footer">
                  <p>Don't have an account?{' '}
                    <span className="login-register-link" onClick={() => wipeNavigate('/register', 'ltr')}>Register here</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Branding Panel */}
        <div className="login-right-panel">
          <img src="../assets/images/kenilworth.png" alt="Kenilworth" className="login-brand-logo" />
          <h1 className="login-brand-title">Drone Services<br />Management System</h1>
          <p className="login-brand-subtitle">Sign in to continue</p>
          <ul className="login-brand-features">
            <li>
              <span className="login-feature-icon">&#9873;</span>
              <span>Real-time drone operations monitoring</span>
            </li>
            <li>
              <span className="login-feature-icon">&#9881;</span>
              <span>Fleet &amp; equipment management</span>
            </li>
            <li>
              <span className="login-feature-icon">&#128202;</span>
              <span>Plantation analytics &amp; reporting</span>
            </li>
            <li>
              <span className="login-feature-icon">&#128274;</span>
              <span>Secure role-based access control</span>
            </li>
          </ul>
          <span className="login-brand-footer">Powered by Kenilworth International</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
