// const express = require('express');
// const router = express.Router();
// const { sendOtp, verify_otp ,resendOtp} = require('../controllers/otp_controller');

// router.route("/sendotp").post(sendOtp);

// router.route("/verifyotp").post(verify_otp);
// // router.route("/verifyotp").post(verify_otp);
// router.route("/resendOtp").post(resendOtp);



// module.exports = router;


const express = require('express');
const router = express.Router();

// Import your OTP controller functions
const { sendOtp, verifyOtp, resendOtp } = require('../controllers/otp_controller'); // Make sure the path is correct

// Define routes
router.post('/sendotp', sendOtp);
router.post('/verifyotp', verifyOtp);
router.post('/resendotp', resendOtp);

module.exports = router;
