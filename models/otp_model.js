// models/Otp.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  cust_contact: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }
});

module.exports = mongoose.model('Otp', otpSchema);
