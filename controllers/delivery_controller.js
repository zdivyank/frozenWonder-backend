const delivery = require('../models/delivery_model');
const User = require('../models/user_model');

const findDeliveryBoy = async () => {
    try {
        // Find the user where the role is delivery_person by directly querying the role collection
        const deliveryBoy = await User.findOne({}).populate({
            path: 'role',
            match: { name: 'delivery_person' },
        });

        if (!deliveryBoy) {
            throw new Error('Delivery boy not found');
        }

        return deliveryBoy._id;
    } catch (error) {
        console.error('Error finding delivery boy:', error);
        throw error;
    }
}

const add_delivery = async (req, res) => {
    const { order_id, deliveryBoy_id, agency_id } = req.body;

    try {
        // Check if a delivery entry for this delivery boy already exists
        let existingDelivery = await delivery.findOne({ deliveryBoy_id });

        if (existingDelivery) {
            // If it exists, add the new order_id to the array
            existingDelivery.order_id.push(order_id);
            await existingDelivery.save();
            res.status(200).json({ "Message": "Order added to existing delivery", "Delivery": existingDelivery });
        } else {
            // If it doesn't exist, create a new delivery entry
            const newDelivery = await delivery.create({
                order_id: [order_id], // Create an array with the new order_id
                deliveryBoy_id,
                agency_id
            });
            res.status(200).json({ "Message": "New delivery created", "Delivery": newDelivery });
        }
    } catch (error) {
        res.status(400).json({ "Message": error.message });
    }
};
const get_delivery = async (req, res) => {
    try {
        const response = await delivery.find()
            .populate({ path: 'order_id', model: 'orders' })
            .populate({ path: 'deliveryBoy_id', model: 'users' })
            .populate({ path: 'agency_id', model: 'agencies' });
        
        res.status(200).json({ "message": response });
    } catch (error) {
        res.status(400).json({ "message": error.message });
    }
};


const remove_delivery = async (req, res) => {

    const { _id } = req.params;
    try {
        const response = await delivery.findByIdAndDelete(_id);
        res.status(200).json({ "message": response });
    } catch (error) {
        res.status(400).json({ "message": error.message });
    }
};

const fetchDeliveryboy = async(req,res)=>{
    const { agency_id } = req.body;

    try {
      
      const deliveryBoys = await User.find({
        agency_id: agency_id,
        role: { $exists: true },
      }).populate({
        path: 'role',
        match: { name: 'delivery_person' },
      });
  
      // Filter out any users where the role does not match
      const filteredDeliveryBoys = deliveryBoys.filter(boy => boy.role && boy.role.name === 'delivery_person');
  
      res.status(200).json({ deliveryBoys: filteredDeliveryBoys });
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
      res.status(500).json({ message: 'Failed to fetch delivery boys' });
    }
}


const personWise_delivery = async (req,res)=>{
    try {
        const {deliveryBoy_id} = req.body;

        const response = await delivery.find({deliveryBoy_id});

        return res.status(200).json({"Message":response})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch personWise_delivery' });
        
    }
}



module.exports = { findDeliveryBoy,add_delivery, get_delivery, remove_delivery,fetchDeliveryboy,personWise_delivery };
