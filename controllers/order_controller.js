const Order = require('../models/order_model');
const moment = require('moment');
const mongoose = require('mongoose');

const addorder = async (req, res) => {
  try {
    const { order_date, timeslot, selected_address } = req.body;
    const formattedOrderDate = moment(order_date).format('YYYY-MM-DD');

    const blocked = await Order.findOne({
      blocked_dates: {
        $elemMatch: {
          date: new Date(formattedOrderDate),
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

    const now = moment();
    const orderDateTime = moment(formattedOrderDate + ' ' + (timeslot === 'morning' ? '08:00' : '16:00'), 'YYYY-MM-DD HH:mm');
    
    if (orderDateTime.diff(now, 'hours') < 12) {
      return res.status(400).json({ message: 'Orders must be placed at least 12 hours in advance.' });
    }

    const newOrder = new Order({
      ...req.body,
      order_date: new Date(formattedOrderDate),
      selected_address: selected_address // Make sure this is the index of the selected address
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
    const response = await Order.find();
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
    const response = await Order.findByIdAndDelete(_id);
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
    const response = await Order.distinct("pincode");
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
    const response = await Order.find({ pincode });
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
    const response = await Order.findByIdAndUpdate(_id, { status: status }, { new: true });
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
    const formattedDate = moment(date).format('YYYY-MM-DD');

    const existingBlock = await Order.findOne({
      'blocked_dates.date': new Date(formattedDate),
      'blocked_dates.timeslot': timeslot,
    });

    if (existingBlock) {
      return res.status(400).json({ message: 'This date and timeslot are already blocked.' });
    }

    const result = await Order.updateOne(
      {},
      { $push: { blocked_dates: { date: new Date(formattedDate), timeslot } } },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      res.status(200).json({ message: 'Date and timeslot blocked successfully.' });
    } else {
      res.status(400).json({ message: 'Failed to block date and timeslot.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while blocking the date.' });
  }
};

const unblockDate = async (req, res) => {
  const { date, timeslot } = req.body;

  try {
    const formattedDate = moment(date).format('YYYY-MM-DD');

    const result = await Order.updateOne(
      {},
      { $pull: { blocked_dates: { date: new Date(formattedDate), timeslot } } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Date and timeslot unblocked successfully.' });
    } else {
      res.status(404).json({ message: 'This date and timeslot were not blocked.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while unblocking the date.' });
  }
};

const fetchBlockedDates = async (req, res) => {
  try {
    const blockedDates = await Order.aggregate([
      { $unwind: '$blocked_dates' },
      { $group: { _id: null, blocked_dates: { $push: '$blocked_dates' } } },
      { $project: { _id: 0, blocked_dates: 1 } }
    ]);

    if (blockedDates.length > 0 && blockedDates[0].blocked_dates.length > 0) {
      res.status(200).json(blockedDates[0].blocked_dates);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.log('Error fetching blocked dates:', error);
    res.status(500).json({ message: 'An error occurred while fetching blocked dates.' });
  }
};

const fetchFullday = async (req, res) => {
  try {
    const today = moment().startOf('day');

    const blockedDates = await Order.aggregate([
      { $unwind: '$blocked_dates' },
      {
        $match: {
          'blocked_dates.timeslot': 'fullday',
          'blocked_dates.date': { $gte: today.toDate() }
        }
      },
      {
        $group: {
          _id: '$blocked_dates.date',
          date: { $first: '$blocked_dates.date' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    const fulldayDates = blockedDates.map(item => moment(item.date).format('YYYY-MM-DD'));

    res.status(200).json(fulldayDates);
  } catch (error) {
    console.error('Error fetching full-day blocked dates:', error);
    res.status(500).json({ message: 'An error occurred while fetching full-day blocked dates.' });
  }
};

const isAlreadyuser = async (req, res) => {
  const { cust_number } = req.body;
  try {
    const response = await Order.find({ cust_number });
    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred while checking user existence.' });
  }
};
const addaddress = async (req, res) => {
  try {
    const { cust_number, address, label } = req.body;

    const customer = await Order.findOne({ cust_number });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.cust_addresses.push({ address, label });
    await customer.save();

    res.status(200).json(customer);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Failed to add address' });
  }
};
const deleteAdress = async (req, res) => {
  const { cust_number, addressIndex } = req.body;

  try {
    const customer = await Order.findOne({ cust_number });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (addressIndex < 0 || addressIndex >= customer.cust_addresses.length) {
      return res.status(400).json({ message: 'Invalid address index' });
    }

    customer.cust_addresses.splice(addressIndex, 1);
    await customer.save();

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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
  fetchFullday,
  isAlreadyuser,
  deleteAdress,
  addaddress
};