const order = require('../models/order_model');
const moment = require('moment');


const addorder = async (req, res) => {
  try {
    const { order_date, timeslot } = req.body;

    // Convert order_date to YYYY-MM-DD format
    const formattedOrderDate = moment(order_date).format('YYYY-MM-DD');

    // Check if the date or timeslot is blocked
    const blocked = await order.findOne({
      blocked_dates: {
        $elemMatch: {
          date: formattedOrderDate,
          $or: [
            { timeslot: timeslot },
            { timeslot: 'fullday' }
          ]
        }
      }
    });

    if (blocked) {
      return res.status(400).json({ message: 'This date and timeslot are not available for Delivery.' });
    }

    // Check if the order is being placed at least 12 hours in advance
    const now = moment();
    const orderDateTime = moment(formattedOrderDate + ' ' + (timeslot === 'morning' ? '08:00' : '16:00'), 'YYYY-MM-DD HH:mm');
    
    if (orderDateTime.diff(now, 'hours') < 12) {
      return res.status(400).json({ message: 'Orders must be placed at least 12 hours in advance.' });
    }

    // If not blocked and within time limit, create the order
    const newOrder = new order({
      ...req.body,
      order_date: formattedOrderDate // Store the formatted date
    });
    await newOrder.save();
    return res.status(200).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Failed to place order' });
  }
};  
const vieworder = async (req, res) => {
  try {
    const response = await order.find();
    if (response.length === 0) {
      return res.status(404).json({ message: 'No Orders Found' });
    }
    return res.status(200).json({ orders: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};

const deleteorder = async (req, res) => {
  try {
    const { _id } = req.params;
    const response = await order.findByIdAndDelete(_id);
    if (!response) {
      return res.status(404).json({ message: 'No Order Found' });
    }
    return res.status(200).json({ message: 'Order deleted successfully', deletedOrder: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Failed to delete order' });
  }
};

const allPincode = async (req, res) => {
  try {
    const response = await order.distinct("pincode");
    if (response.length === 0) {
      return res.status(404).json({ message: 'No Pincodes Found' });
    }
    return res.status(200).json({ pincodes: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Failed to fetch pincodes' });
  }
};

const locationWiseOrder = async (req, res) => {
  const { pincode } = req.body;
  try {
    const response = await order.find({ pincode });
    if (response.length === 0) {
      return res.status(404).json({ message: 'No Orders Found for this Pincode' });
    }
    return res.status(200).json({ orders: response, message: 'Orders Fetched Successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Failed to fetch orders for this location' });
  }
};

const updateStatus = async (req, res) => {
  const { _id } = req.params;
  const { status } = req.body;
  try {
    const response = await order.findByIdAndUpdate(_id, { status: status }, { new: true });
    if (!response) {
      return res.status(404).json({ message: 'Order Not Found' });
    }
    return res.status(200).json({ message: 'Status updated successfully', order: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Failed to update order status' });
  }
};

const blockDate = async (req, res) => {
  const { date, timeslot } = req.body;
  try {
    // Convert and format the date
    const formattedDate = moment(date).format('YYYY-MM-DD');

    // Check if the date is already blocked
    const existingBlock = await order.findOne({ 
      'blocked_dates.date': formattedDate, 
      'blocked_dates.timeslot': timeslot 
    });
    
    if (existingBlock) {
      return res.status(400).json({ message: 'This date and timeslot are already blocked.' });
    }

    const result = await order.updateOne(
      {},
      { $push: { blocked_dates: { date: formattedDate, timeslot } } },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      res.status(200).json({ message: 'Date and timeslot blocked successfully.' });
    } else {
      res.status(400).json({ message: 'Failed to block date and timeslot.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred while blocking the date.' });
  }
};

const unblockDate = async (req, res) => {
  const { date, timeslot } = req.body;
  try {
    // Convert and format the date
    const formattedDate = moment(date).format('YYYY-MM-DD');

    const result = await order.updateOne(
      {},
      { $pull: { blocked_dates: { date: formattedDate, timeslot } } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Date and timeslot unblocked successfully.' });
    } else {
      res.status(404).json({ message: 'This date and timeslot were not blocked.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred while unblocking the date.' });
  }
};

const fetchBlockedDates = async (req, res) => {
  try {
    const blockedDates = await order.findOne({}, { blocked_dates: 1, _id: 0 });
    res.status(200).json(blockedDates?.blocked_dates || []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred while fetching blocked dates.' });
  }
};


const fetchFullday = async (req, res) => {
  try {
    const blockedDates = await order.find({
      'blocked_dates.timeslot': 'fullday'
    }, { 'blocked_dates.date': 1, _id: 0 });

    // Flatten the array and extract only unique dates
    const fulldayDates = [...new Set(blockedDates.flatMap(bd => bd.blocked_dates.map(block => block.date)))];

    res.status(200).json(fulldayDates);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred while fetching full-day blocked dates.' });
  }
};


module.exports = { 
  addorder, 
  vieworder,
  deleteorder,
  locationWiseOrder,
  allPincode,
  updateStatus,
  blockDate,
  fetchBlockedDates,
  unblockDate,
  fetchFullday
};