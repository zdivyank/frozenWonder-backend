const express = require('express');
const router = express.Router();
const {add_delivery, get_delivery, remove_delivery,fetchDeliveryboy } = require('../controllers/delivery_controller');

router.post('/adddelivery',add_delivery);
router.get('/getdelivery',get_delivery);
router.delete('/removedelivery/:_id',remove_delivery);
router.post('/fetchDeliveryBoys',fetchDeliveryboy);

module.exports = router;
