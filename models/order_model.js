const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  cust_name: {
    type: String,
    required: true
  },
  cust_addresses: [{
    type: String,
    required: true
  }],
  cust_number: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  order_product: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  order_date: {
    type: Date,
    required: true
  },
  timeslot: {
    type: String,
    enum: ['morning', 'evening'],
    required: true
  },
  status: {
    type: String,
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  }
});

const Order = mongoose.model('orders', orderSchema);
module.exports = Order;