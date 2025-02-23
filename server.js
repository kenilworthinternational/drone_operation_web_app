require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/send-otp', async (req, res) => {
  const { phoneNumber, otp } = req.query;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: 'Missing phone number or OTP' });
  }

  const apiUrl = `https://sms.airtel.lk:5001/sms/send_sms.php?username=${process.env.AIRTEL_USERNAME}&password=${process.env.AIRTEL_PASSWORD}&src=${process.env.AIRTEL_SRC}&dst=${phoneNumber}&msg=Your+Nation+One+OTP+is+${otp}&dr=1`;

  try {
    const response = await axios.get(apiUrl);
    res.json({ success: true, message: 'OTP sent successfully', data: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
