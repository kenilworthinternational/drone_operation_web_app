require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const SMS_API_URL = 'http://sms.textware.lk:5000/sms/send_sms.php';
const SMS_USERNAME = process.env.SMS_USERNAME;
const SMS_PASSWORD = process.env.SMS_PASSWORD;
const SMS_SRC = process.env.SMS_SRC;

app.post('/:phoneNumber', async (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    const { msg } = req.body;

    if (!msg) {
        return res.status(400).json({ error: 'Message content is required.' });
    }

    try {
        const params = new URLSearchParams({
            username: SMS_USERNAME,
            password: SMS_PASSWORD,
            src: SMS_SRC,
            dst: phoneNumber,
            msg: msg,
            dr: '1'
        });

        const smsRes = await axios.get(`${SMS_API_URL}?${params.toString()}`);
        res.json({ status: 'sent', response: smsRes.data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send SMS', details: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`SMS API server running on port ${PORT}`);
});