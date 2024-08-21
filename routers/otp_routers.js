const express = require('express');
const router = express.Router();
const { sendOtp, verify_otp } = require('../controllers/otp_controller');

router.route("/sendotp").post(sendOtp);

router.route("/verifyotp").post(verify_otp);
// router.route("/verifyotp").post(verify_otp);

module.exports = router;
