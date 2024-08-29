const coupon = require('../models/coupon_model');

const add_coupon = async (req, res) => {
  const { code,discount,usage_limit,usage_count } = req.body;

  try {
   const response = await coupon.create({code,discount,usage_limit,usage_count})

    res.status(200).json({ "Message": response });
  } catch (error) {
    res.status(400).json({ "Message": error.message });
  }
};

const get_coupon = async (req, res) => {
  try {
    const response = await coupon.find();
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};

const remove_coupon = async (req, res) => {

    const {_id} = req.params;
  try {
    const response = await coupon.findByIdAndDelete(_id);
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};


const edit_coupon = async (req,res) => {
  const {_id} = req.params;
  const {code,discount,usage_limit,usage_count }= req.body;
  try {
    const response = await coupon.findByIdAndUpdate(_id,{code,discount,usage_limit,usage_count},{ new: true }  );
    console.log(response);
    
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
}



// const validate_coupon = async (req,res) => {
//     try {
//         const { coupon_code } = req.body;
    
//         const coupon = await coupon.findOne({ code: coupon_code });
//         if (!coupon) {
//           return res.status(400).json({ message: 'Invalid coupon code' });
//         }
    
//         let customerCounter = await CustomerCounter.findOne();
//         if (!customerCounter) {
//           customerCounter = new CustomerCounter({ count: 0 });
//         }
    
//         const isFreeOrder = customerCounter.count < 500;
//         if (isFreeOrder) {
//           res.json({ isFreeOrder: true });
//         } else {
//           res.json({ isFreeOrder: false });
//         }
//       } catch (error) {
//         res.status(500).json({ message: 'Error validating coupon', error: error.message });
//       }
//     };
module.exports = {add_coupon, get_coupon, remove_coupon,edit_coupon};
