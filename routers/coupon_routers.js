const express = require('express');
const router = express.Router();
const {add_coupon, get_coupon, remove_coupon } = require('../controllers/coupon_controller');

router.post('/addcoupon',add_coupon);
router.get('/getcoupon',get_coupon);
router.delete('/removecoupon/:_id',remove_coupon);

module.exports = router;
