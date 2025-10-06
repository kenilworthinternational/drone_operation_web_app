import { useState } from 'react';

const useOTPService = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Generate a random 4-digit OTP
  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Send OTP via backend proxy
  const sendOTP = async (phoneNumber) => {
    const generatedOTP = generateOTP();
    console.log('Generated OTP:', generatedOTP);

    setIsLoading(true);
    setErrorMessage('');
    setIsVerified(false);

    try {
      // Validate phone number format (9 digits, no leading 0)
      if (!/^\d{9}$/.test(phoneNumber) || phoneNumber.startsWith('0')) {
        throw new Error('Invalid phone number format');
      }

      const url = ``;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to send OTP: HTTP ${response.status}`);
      }

      setOtp(generatedOTP);
      setIsLoading(false);
      console.log('OTP sent successfully:', data);
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.message || 'Failed to send OTP. Please try again.';
      setErrorMessage(errorMsg);
      console.error('Error sending OTP:', error);
    }
  };

  // Verify OTP
  const verifyOTP = (enteredOTP) => {
    if (!/^\d{4}$/.test(enteredOTP)) {
      setIsVerified(false);
      setErrorMessage('OTP must be a 4-digit number');
      return false;
    }

    if (otp === enteredOTP) {
      setIsVerified(true);
      setErrorMessage('');
      console.log('OTP verified successfully');
      return true;
    } else {
      setIsVerified(false);
      setErrorMessage('Invalid OTP');
      console.log('Invalid OTP entered:', enteredOTP);
      return false;
    }
  };

  return {
    otp,
    isLoading,
    errorMessage,
    isVerified,
    sendOTP,
    verifyOTP,
  };
};

export default useOTPService;