const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestimonailsSchema = new Schema({
  cust_name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
  contact_number: {
    type: String,
    required: false,
  },
 verify: {
    type: Boolean,
    default:false,
    required: true,
  }
});

module.exports = mongoose.model('testimonails', TestimonailsSchema);
