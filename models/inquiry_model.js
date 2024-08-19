const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InquiriesSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  company_name: {
    type: String,
    required: true,
  },
  user_number: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('inquiries', InquiriesSchema);
