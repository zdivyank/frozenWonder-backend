const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  label: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  cust_name: { type: String, required: true },
  cust_number: { type: String, required: true },
  cust_addresses: [addressSchema],
  selected_address: { type: Number, required: true },
  pincode: { type: String, required: true },
  order_date: { type: Date, required: true },
  timeslot: { type: String, required: true },
  order_product: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  status: { type: String, default: 'Pending' },
  total_amount: { type: Number, required: true }
});

// Add blocked_dates field to the schema
orderSchema.add({
  blocked_dates: [{
    date: { type: Date, required: true },
    timeslot: { type: String, required: true }
  }]
});

module.exports = mongoose.model('orders', orderSchema);