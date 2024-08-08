const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestimonailsSchema = new Schema({
  cust_name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('testimonails', TestimonailsSchema);
