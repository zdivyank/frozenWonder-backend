const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  label: { type: String }
});

const orderSchema = new mongoose.Schema({
  cust_name: { type: String, required: true },
  cust_number: { type: String, required: true },//email
  cust_contact: { type: String, required: true },//number
  // cust_number: { type: String, required: true },
  // cust_address: [addressSchema],
  cust_address: [{ type: String, required: true }],
  // selected_address: { type: String, required: true },,
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
  total_amount: { type: Number, required: true },
  agency_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'agencies',
    required: false
  },
  coupon_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'coupons',
    default: null
  },
  assigned_delivery_boys:
    {
      type: Boolean,
      default:"false"
    },
    unique_code: {
      type: String,
      unique: true
    }
});

// Add blocked_dates field to the schema
orderSchema.add({
  blocked_dates: [{
    date: { type: Date, required: true },
    timeslot: { type: String, required: true }
  }]
});



const incrementCode = (code) => {
  const letters = code.slice(0, 2); // Extract letters (AA, AB, etc.)
  let number = parseInt(code.slice(2), 10); // Extract numbers (0001, 0002, etc.)
  
  if (number < 9999) {
    // Increment the number part
    number += 1;
  } else {
    // Reset the number part to 0001 and increment the letters part
    number = 1;
    
    const firstLetter = letters.charAt(0);
    const secondLetter = letters.charAt(1);
    
    if (secondLetter !== 'Z') {
      // Increment the second letter
      const newSecondLetter = String.fromCharCode(secondLetter.charCodeAt(0) + 1);
      return `${firstLetter}${newSecondLetter}0001`;
    } else if (firstLetter !== 'Z') {
      // Reset second letter to 'A' and increment the first letter
      const newFirstLetter = String.fromCharCode(firstLetter.charCodeAt(0) + 1);
      return `${newFirstLetter}A0001`;
    } else {
      // When both letters reach 'ZZ', return an error or handle overflow as needed
      throw new Error('Unique code limit reached');
    }
  }
  
  // Format the number to be 4 digits (e.g., 0001)
  const formattedNumber = String(number).padStart(4, '0');
  
  return `${letters}${formattedNumber}`;
};


orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
    
      const lastOrder = await mongoose.model('orders').findOne({}).sort({ unique_code: -1 });
      let newCode = 'AA0001'; // Starting point for the first code
      
      if (lastOrder && lastOrder.unique_code) {
        newCode = incrementCode(lastOrder.unique_code);
      }
      
      this.unique_code = newCode;
      console.log('Generated unique code:', newCode); // Log the generated unique code
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('orders', orderSchema);