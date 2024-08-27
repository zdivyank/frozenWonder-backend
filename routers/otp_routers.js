const express = require('express');
const router = express.Router();
const { sendOtp, verify_otp ,resendOtp} = require('../controllers/otp_controller');

router.route("/sendotp").post(sendOtp);

router.route("/verifyotp").post(verify_otp);
// router.route("/verifyotp").post(verify_otp);
router.route("/resendOtp").post(resendOtp);

module.exports = router;
