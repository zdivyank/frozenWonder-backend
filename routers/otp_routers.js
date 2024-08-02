const express = require('express');
const router = express.Router();
const { send_otp,verify_otp } = require('../controllers/otp_controller');

router.route("/sendotp").post(send_otp);

router.route("/verifyotp").post(verify_otp);

module.exports = router;
