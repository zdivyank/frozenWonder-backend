const dotenv = require('dotenv');
const OTP = require('../models/otp_model');
const crypto = require('crypto');
const Mailgun = require('mailgun.js');
const formData = require('form-data');

// Load environment variables from .env file
dotenv.config();

const sendOtp = async (req, res) => {
  const { cust_number } = req.body;

  if (!cust_number) {
    return res.status(400).json({ error: 'cust_number is required' });
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  // Configure Mailgun
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });

  const data = {
    from: `${process.env.MAILGUN_SENDER}`,
    to: cust_number,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  // Send the OTP via email
  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN, data);

    // Store OTP in MongoDB
    const otpRecord = new OTP({ cust_number, otp });
    await otpRecord.save();

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verify_otp = async (req, res) => {
  const { cust_number, otp } = req.body;

  if (!cust_number || !otp) {
    return res.status(400).json({ error: 'cust_number and OTP are required' });
  }

  try {
    // Find the OTP record in MongoDB
    const otpRecord = await OTP.findOne({ cust_number, otp });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // OTP is valid, proceed with your logic
    res.status(200).json({ message: 'OTP verified successfully' });

    // Optionally, delete the OTP record after verification
    await OTP.deleteOne({ _id: otpRecord._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

module.exports = { sendOtp, verify_otp };
