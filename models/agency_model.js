const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agencySchema = new Schema({
    agency_name: {
        type: String,
        required: true,
      },
      owner: {
          type: String,
          required: true,
        },
    mobile_number: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },

    gstno: {
        type: String,
        required: true,
      },
    logo: {
        type: String,
        required: true,
      },
    address: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
    },
    admin_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', 
        required: true
    }
});

module.exports = mongoose.model('agencies', agencySchema);
