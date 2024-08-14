const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true }, // Discount percentage (e.g., 100 for 100%)
  usage_limit: { type: Number, required: true }, // Maximum number of times the coupon can be used
  usage_count: { type: Number, default: 0 }, 
 status:{type:Boolean,default:true}
});

const Coupon = mongoose.model('coupons', couponSchema);

module.exports = Coupon;
