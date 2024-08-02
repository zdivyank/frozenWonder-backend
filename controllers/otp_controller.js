const dotenv = require('dotenv');
const OTP = require('../models/otp_model');


const send_otp = async(req,res)=>{
    const { phoneNumber } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
   
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}

const verify_otp = async(req,res)=>{
    const { phoneNumber, otp } = req.body;

    try {
   
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
}
module.exports = {send_otp,verify_otp}  