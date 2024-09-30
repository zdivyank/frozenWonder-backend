// const dotenv = require('dotenv');
// const OTP = require('../models/otp_model');
// const crypto = require('crypto');
// const Mailgun = require('mailgun.js');
// const formData = require('form-data');
// const moment = require('moment');


// // Load environment variables from .env file
// dotenv.config();

// const sendOtp = async (req, res) => {
//   const { cust_number } = req.body;

//   if (!cust_number) {
//     return res.status(400).json({ error: 'cust_number is required' });
//   }

//   const otp = crypto.randomInt(100000, 999999).toString();

//   // Configure Mailgun
//   const mailgun = new Mailgun(formData);
//   const mg = mailgun.client({
//     username: 'api',
//     key: process.env.MAILGUN_API_KEY,
//   });

//   const data = {
//     from: `${process.env.MAILGUN_SENDER}`,
//     to: cust_number,
//     subject: 'Your OTP Code',
//     text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
//   };

//   // Send the OTP via email
//   try {
//     await mg.messages.create(process.env.MAILGUN_DOMAIN, data);

//     // Store OTP in MongoDB
//     const otpRecord = new OTP({ cust_number, otp });
//     await otpRecord.save();

//     res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to send OTP' });
//   }
// };

// const verify_otp = async (req, res) => {
//   const { cust_number, otp } = req.body;

//   if (!cust_number || !otp) {
//     return res.status(400).json({ error: 'cust_number and OTP are required' });
//   }

//   try {
//     // Find the OTP record in MongoDB
//     const otpRecord = await OTP.findOne({ cust_number, otp });

//     if (!otpRecord) {
//       return res.status(400).json({ error: 'Invalid or expired OTP' });
//     }

//     // OTP is valid, proceed with your logic
//     res.status(200).json({ message: 'OTP verified successfully' });

//     // Optionally, delete the OTP record after verification
//     await OTP.deleteOne({ _id: otpRecord._id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to verify OTP' });
//   }
// };

// const resendOtp = async (req, res) => {
//   const { cust_number } = req.body;

//   if (!cust_number) {
//     return res.status(400).json({ error: 'cust_number is required' });
//   }

//   // Find the latest OTP record for this customer number
//   const existingOtp = await OTP.findOne({ cust_number }).sort({ createdAt: -1 });

//   let otp;

//   // Check if the OTP exists and is still valid (e.g., within 5 minutes)
//   if (existingOtp && moment().diff(moment(existingOtp.createdAt), 'minutes') < 5) {
//     otp = existingOtp.otp; // Resend the existing OTP
//   } else {
//     otp = crypto.randomInt(100000, 999999).toString(); // Generate a new OTP
//   }

//   // Configure Mailgun
//   const mailgun = new Mailgun(formData);
//   const mg = mailgun.client({
//     username: 'api',
//     key: process.env.MAILGUN_API_KEY,
//   });

//   const data = {
//     from: `${process.env.MAILGUN_SENDER}`,
//     to: cust_number,
//     subject: 'Your OTP Code',
//     text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
//   };

//   try {
//     await mg.messages.create(process.env.MAILGUN_DOMAIN, data);

//     // Save the new OTP if it was generated
//     if (!existingOtp || otp !== existingOtp.otp) {
//       const otpRecord = new OTP({ cust_number, otp });
//       await otpRecord.save();
//     }

//     res.status(200).json({ message: 'OTP resent successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to resend OTP' });
//   }
// };


// module.exports = { sendOtp, verify_otp,resendOtp };
const dotenv = require('dotenv');
const OTP = require('../models/otp_model'); // Your MongoDB model for storing OTPs
const crypto = require('crypto');
const fetch = require('node-fetch');
const moment = require('moment');

// Load environment variables from .env file
dotenv.config();

// Function to send OTP via SMS using Videocon API
const sendOtp = async (req, res) => {
  const { cust_contact } = req.body;

  if (!cust_contact) {
    return res.status(400).json({ error: 'cust_contact is required' });
  }

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Construct the message text to match your approved DLT template
  const smsText = `OTP verification code is: ${otp}. Please use this code to place your order. The code is valid for 5 minutes. Thank you for choosing FROZEN WONDERS.`;

  // Construct the encoded URL
  const encodedSmsText = encodeURIComponent(smsText);
  const smsUrl = `${process.env.VIDEOCON_API_BASE_URL}?user=${process.env.VIDEOCON_API_USER}&password=${process.env.VIDEOCON_API_PASSWORD}&senderid=${process.env.VIDEOCON_API_SENDERID}&channel=Trans&DCS=0&flashsms=0&number=${cust_contact}&text=${encodedSmsText}&route=${process.env.VIDEOCON_API_ROUTE}`;

  try {
    // Send the OTP via SMS using the Videocon API
    const response = await fetch(smsUrl);

    // Check for HTTP errors
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to send OTP', details: response.statusText });
    }

    // Parse the response text
    const data = await response.text();

    // Convert the response text to JSON
    const jsonResponse = JSON.parse(data);

    // Check if the OTP was sent successfully
    if (jsonResponse.ErrorCode === "000") {
      // Store OTP in MongoDB
      const otpRecord = new OTP({ cust_contact, otp });
      await otpRecord.save();

      // Return success response with additional details
      res.status(200).json({ message: 'OTP sent successfully', details: jsonResponse });
    } else {
      // Log the error from the SMS gateway and return failure response
      res.status(500).json({ error: 'Failed to send OTP', details: jsonResponse });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP', details: error.message });
  }
};


// Function to verify OTP
const verifyOtp = async (req, res) => {
  const { cust_contact, otp } = req.body;

  if (!cust_contact || !otp) {
    return res.status(400).json({ error: 'cust_contact and OTP are required' });
  }

  try {
    // Find the OTP record in MongoDB
    const otpRecord = await OTP.findOne({ cust_contact, otp });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // OTP is valid, proceed with your logic
    res.status(200).json({ message: 'OTP verified successfully' });

    // Optionally, delete the OTP record after verification
    await OTP.deleteOne({ _id: otpRecord._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify OTP', details: error.message });
  }
};

// Function to resend OTP
const resendOtp = async (req, res) => {
  const { cust_contact } = req.body;

  if (!cust_contact) {
    return res.status(400).json({ error: 'cust_contact is required' });
  }

  try {
    // Find the latest OTP record for this customer number
    const existingOtp = await OTP.findOne({ cust_contact }).sort({ createdAt: -1 });

    let otp;

    // Check if the OTP exists and is still valid (e.g., within 5 minutes)
    if (existingOtp && moment().diff(moment(existingOtp.createdAt), 'minutes') < 5) {
      otp = existingOtp.otp; // Resend the existing OTP
    } else {
      otp = crypto.randomInt(100000, 999999).toString(); // Generate a new OTP
    }

    // Construct the SMS API URL
    const smsUrl = `${process.env.VIDEOCON_API_BASE_URL}?user=${process.env.VIDEOCON_API_USER}&password=${process.env.VIDEOCON_API_PASSWORD}&senderid=${process.env.VIDEOCON_API_SENDERID}&channel=Trans&DCS=0&flashsms=0&number=${cust_contact}&text=Your OTP verification code is: ${otp}. It is valid for 5 minutes. Thank you for choosing FROZEN WONDERS.&route=${process.env.VIDEOCON_API_ROUTE}`;

    // Send the OTP via SMS using the Videocon API
    const response = await fetch(smsUrl);

    // Check for HTTP errors
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to resend OTP', details: response.statusText });
    }

    const data = await response.text();

    // Save the new OTP if it was generated
    if (!existingOtp || otp !== existingOtp.otp) {
      const otpRecord = new OTP({ cust_contact, otp });
      await otpRecord.save();
    }

    res.status(200).json({ message: 'OTP resent successfully', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resend OTP', details: error.message });
  }
};

module.exports = { sendOtp, verifyOtp, resendOtp };

