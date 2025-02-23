import { useState } from 'react';

const useOTPService = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Generate a random 4-digit OTP
  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  };

  // Send OTP via API
  const sendOTP = async (phoneNumber) => {
    const generatedOTP = generateOTP();
    console.log('Generated OTP:', generatedOTP);
  
    setIsLoading(true);
    setErrorMessage('');
    setIsVerified(false);
  
    try {
      const response = await fetch(`http://ec2-16-16-66-223.eu-north-1.compute.amazonaws.com:5000/send-otp?phoneNumber=${phoneNumber}&otp=${generatedOTP}`);
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.error || 'Error sending OTP');
  
      setOtp(generatedOTP);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(`Error sending OTP: ${error.message}`);
      console.error('Error:', error);
    }
  };
  
  

  // Verify OTP
  const verifyOTP = (enteredOTP) => {
    if (otp === enteredOTP) {
      setIsVerified(true);
      setErrorMessage('');
    } else {
      setIsVerified(false);
      setErrorMessage('Invalid OTP');
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
