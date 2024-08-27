const Order = require('../models/order_model');
const User = require('../models/user_model');
const Agency = require('../models/agency_model');
const moment = require('moment');
const mongoose = require('mongoose');
const opencage = require('opencage-api-client');

// const Order = require('../models/order_model');
const Coupon = require('../models/coupon_model');

// async function geocodeAddress(address, retries = 3) {
//   for (let attempt = 0; attempt < retries; attempt++) {
//     try {
//       if (!process.env.OPENCAGE_API_KEY) {
//         throw new Error('OPENCAGE_API_KEY is not defined in environment variables');
//       }

//       console.log(`Requesting geocode for: ${address} (Attempt ${attempt + 1})`);

//       const response = await opencage.geocode({ q: address, key: process.env.OPENCAGE_API_KEY });

//       if (response.status.code !== 200) {
//         console.error('Error response from OpenCage:', response);
//         continue; // Try again
//       }

//       if (response.results.length > 0) {
//         const { lat, lng } = response.results[0].geometry;
//         return { lat, lng };
//       } else {
//         console.error('No results found for address:', address);
//       }
//     } catch (error) {
//       console.error(`Error geocoding address (Attempt ${attempt + 1}):`, error);
//       if (attempt === retries - 1) throw error; // Throw on last attempt
//     }
//   }
//   return null;
// } 

async function geocodeAddress(address, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (!process.env.OPENCAGE_API_KEY) {
        throw new Error('OPENCAGE_API_KEY is not defined in environment variables');
      }

      console.log(`Requesting geocode for: ${address} (Attempt ${attempt + 1})`);

      // Ensure the address includes city and state
      if (!address.includes('Surat') && !address.includes('Gujarat')) {
        address += ', Surat, Gujarat'; // Append default city and state
      }

      const response = await opencage.geocode({ q: address, key: process.env.OPENCAGE_API_KEY });

      if (response.status.code !== 200) {
        console.error('Error response from OpenCage:', response);
        continue; // Try again
      }

      if (response.results.length > 0) {
        const { lat, lng } = response.results[0].geometry;
        return { lat, lng };
      } else {
        console.error('No results found for address:', address);
      }
    } catch (error) {
      console.error(`Error geocoding address (Attempt ${attempt + 1}):`, error);
      if (attempt === retries - 1) throw error; // Throw on last attempt
    }
  }
  return null;
}


async function findNearestDistributor(customerCoords, distributors) {
  if (distributors.length === 1) {
    return distributors[0]; // Return the only available distributor
  }

  let nearestDistributor = null;
  let shortestDistance = Infinity;
  const maxDistanceKm = 500; // Define a reasonable max distance for delivery

  for (const distributor of distributors) {
    try {
      const distributorCoords = await geocodeAddress(distributor.address);
      if (distributorCoords) {
        const distance = getDistanceFromLatLonInKm(
          customerCoords.lat, customerCoords.lng,
          distributorCoords.lat, distributorCoords.lng
        );
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestDistributor = distributor;
        }
      }
    } catch (e) {
      console.error('Error geocoding address:', e);
      continue;
    }
  }

  if (shortestDistance <= maxDistanceKm) {
    return nearestDistributor;
  } else {
    return null; 
  }
}


const addorder = async (req, res) => {
  try {
    const {
      cust_name,
      cust_number,//email
      cust_contact,//number
      pincode,
      order_date,
      timeslot,
      selected_address,
      cust_address,
      order_product,
      coupon_code, // This is the coupon code provided by the user
    } = req.body;

    const formattedOrderDate = moment(order_date).format('YYYY-MM-DD');

    // Calculate the base total amount from the order products
    let baseTotalAmount = 0;
    order_product.forEach(product => {
      baseTotalAmount += product.price * product.quantity;
    });

    // Find the coupon in the database
    let coupon = null;
    if (coupon_code) {
      coupon = await Coupon.findOne({ code: coupon_code });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }

      // Check if coupon usage limit is exceeded
      if (coupon.usage_count >= coupon.usage_limit) {
        return res.status(400).json({ message: 'Coupon code usage limit exceeded' });
      }

      // Apply discount from coupon
      const discount = coupon.discount; // Assuming discount is a percentage
      baseTotalAmount -= baseTotalAmount * (discount / 100);

      // Update coupon usage count
      coupon.usage_count += 1;
      await coupon.save();
    }

    const addressIndex = parseInt(selected_address, 10) - 1;
    if (addressIndex < 0 || addressIndex >= cust_address.length) {
      return res.status(400).json({ message: 'Invalid selected address index' });
    }
    const addressToGeocode = cust_address[addressIndex];

    const customerCoords = await geocodeAddress(addressToGeocode);

    if (!customerCoords) {
      return res.status(400).json({ message: 'Failed to geocode customer address' });
    }

    const distributors = await Agency.find({});
    const nearestAgency = await findNearestDistributor(customerCoords, distributors);

    if (!nearestAgency) {
      return res.status(400).json({ message: 'No nearby distributor found. We may not be able to serve this area.' });
    }

    const blocked = await Order.findOne({
      blocked_dates: {
        $elemMatch: {
          date: new Date(order_date),
          $or: [
            { timeslot: timeslot },
            { timeslot: 'fullday' }
          ]
        }
      }
    });

    if (blocked) {
      return res.status(400).json({ message: 'This date and timeslot are not available for delivery.' });
    }

    const now = moment();
    const orderDateTime = moment(order_date + ' ' + (timeslot === 'morning' ? '08:00' : '16:00'), 'YYYY-MM-DD HH:mm');

    if (orderDateTime.diff(now, 'hours') < 12) {
      return res.status(400).json({ message: 'Orders must be placed at least 12 hours in advance.' });
    }

    const newOrder = new Order({
      cust_name,
      cust_address,
      selected_address: addressIndex,
      cust_contact,
      cust_number,
      pincode,
      order_product,
      total_amount: baseTotalAmount, // Use the calculated total amount
      order_date: new Date(order_date),
      timeslot,
      agency_id: nearestAgency._id,
      coupon_code: coupon ? coupon._id : null, // Save the ObjectId of the coupon
    });

    await newOrder.save();
    await checkAndBlockDateAfter15Orders({ order_date, timeslot });

    return res.status(200).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error in addorder:', error);
    return res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}



const vieworder = async (req, res) => {
  try {
    const response = await Order.find().populate('agency_id', 'agency_name');
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
  console.log('Received request with cust_number:', cust_number); // Add this line
  try {
    // Find the most recent order for the given customer number
    const response = await Order.find({ cust_number })
      .sort({ order_date: -1 }) // Assuming 'order_date' is the field representing the order date
      .limit(1); // Limit to the most recent order

    console.log('Found orders:', response); // Add this line
    res.status(200).json({ response });
  } catch (error) {
    console.log('Error occurred:', error); // Log the error
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

    customer.cust_address.push({ address, label });
    await customer.save();

    res.status(200).json(customer);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Failed to add address' });
  }
};
const deleteAdress = async (req, res) => {
  // const { cust_number, addressIndex } = req.body;
  try {
    const { cust_number, selected_address } = req.body;

    // Find the order by customer number
    const order = await Order.findOne({ cust_number });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure the index is valid
    if (selected_address < 0 || selected_address >= order.cust_address.length) {
      return res.status(400).json({ message: 'Invalid address index' });
    }

    // Remove the address at the given index
    order.cust_address.splice(selected_address, 1);

    // Save the updated order
    await order.save();

    res.status(200).json({ message: 'Address removed successfully' });
  } catch (error) {
    console.error('Error in DELETE /delete-address:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const fetchagencyorder = async (req, res) => {
  try {
    const { _id } = req.body;

    const response = await Order.find({ agency_id: _id });

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  };

  
  const fetchPendingagencyorder = async (req, res) => {
    try {
      const { _id } = req.params;
  
      console.log(_id);
      
      const orders = await Order.find({ 
        agency_id: _id, 
        assigned_delivery_boys: 'false' 
      });
  
      console.log(orders);
  
      if (orders.length === 0) {
        return res.status(404).json({ message: 'No pending orders found for this agency.' });
      }
  
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

  const updateAssignedorder = async (req,res) => {
    try {
      const { order_id } = req.body; 
      // Update the orders to set assigned_delivery_boys to true
      const result = await Order.updateMany(
        { _id: { $in: order_id } },
        { $set: { assigned_delivery_boys: true } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'No orders were updated' });
      }
  
      res.status(200).json({ message: 'Orders updated successfully' });
    } catch (error) {
      console.error('Error updating orders:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
 
  
const assignOrdersToDeliveryBoys = async (req, res) => {


};
const checkAndBlockDateAfter15Orders = async ({ order_date }) => {
  try {
    const formattedDate = moment(order_date).format('YYYY-MM-DD');

    // Count the number of orders for the given date (ignoring timeslot)
    const orderCount = await Order.countDocuments({
      order_date: new Date(formattedDate),
    });

    // If order count reaches 15, block the entire date
    if (orderCount >= 15) {
      const existingBlock = await Order.findOne({
        'blocked_dates.date': new Date(formattedDate),
        'blocked_dates.timeslot': 'fullday',
      });

      if (!existingBlock) {
        await Order.updateOne(
          {},
          { $push: { blocked_dates: { date: new Date(formattedDate), timeslot: 'fullday' } } },
          { upsert: true }
        );
        console.log(`Date blocked automatically: ${formattedDate} (fullday)`);
      }
    }
  } catch (error) {
    console.error('Error in checkAndBlockDateAfter15Orders:', error);
  }
};


const getOrderDetails = async (req, res) => {
  try {
      const { orderId } = req.params;
    
      const order = await Order.findById(orderId);

      if (!order) {
          return res.status(404).json({ "Message": "Order not found" });
      }

      return res.status(200).json(order);
  } catch (error) {
      console.error('Error in getOrderDetails:', error);
      return res.status(500).json({ "Message": "Internal server error" });
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
  addaddress,
  fetchagencyorder,
  assignOrdersToDeliveryBoys,
  checkAndBlockDateAfter15Orders,
  fetchPendingagencyorder,
  updateAssignedorder,
  getOrderDetails
};