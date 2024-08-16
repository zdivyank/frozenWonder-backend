const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({


    order_id:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
        // required: false
    }],
    deliveryBoy_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    agency_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'agencies',
        }
});




module.exports = mongoose.model('deliveries', deliverySchema);