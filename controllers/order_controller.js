
const order = require('../models/order_model');

const addorder = async (req, res) => {
  try {
    // const { cust_name,cust_address,cust_number,order_product,order_date,status,total_amount } = req.body;
    
    // const neworder = await order.create({
    //     cust_name,cust_address,cust_number,order_product,order_date,status,total_amount
    // });
    console.log('Request Body:', req.body); // Log request body

    const orders = new order(req.body);
    await orders.save();
    return res.status(200).json({ message: orders });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Message Not Displaying Successfully ' });
  }
};

const vieworder = async (req, res) => {
  try {
    const response = await order.find();
    if (!response) {
      return res.status(404).json({ message: 'No Order Found' });
    }
    return res.status(200).json({ message: response });
  } catch (error) {

    return res.status(500).json({ message: 'Message Not Displaying Successfully ' });
  }
};
const deleteorder = async (req, res) => {
  try {
    const _id = req.params;
    const response = await order.findByIdAndDelete(_id);
    if (!response) {
      return res.status(404).json({ message: 'No Order Found' });
    }
    console.log("deleted");
    return res.status(200).json({ message: response });
  } catch (error) {

    return res.status(500).json({ message: 'Message Not Displaying Successfully ' });
  }
};

module.exports = { addorder, vieworder,deleteorder };
