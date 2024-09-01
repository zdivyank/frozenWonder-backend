const express = require('express');
const router = express.Router();
const { 
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
  fetchPendingagencyorder,
  updateAssignedorder,
  getOrderDetails,
  excelData
} = require('../controllers/order_controller');

router.route("/addorder").post(addorder);
router.route("/vieworders").get(vieworder);
router.route("/deleteorder/:_id").delete(deleteorder);
router.route("/orderlocation").post(locationWiseOrder);
router.route("/allPincode").get(allPincode);
router.route("/updateStatus/:_id").put(updateStatus);
router.route("/block-date").post(blockDate);
router.route("/unblock-date").post(unblockDate);
router.route("/blocked-dates").get(fetchBlockedDates);
router.route("/fullday").get(fetchFullday);
router.route("/isAlreadyuser").post(isAlreadyuser);
router.route("/delete-address").delete(deleteAdress);
router.post('/addAddress',addaddress )
// router.post('/fetchagencyorder',fetchagencyorder )
router.post('/fetchagencyorder', fetchagencyorder); 
router.get('/fetchpendingagencyorder/:_id',fetchPendingagencyorder); 


router.post('/updateAssignedOrders', updateAssignedorder);
router.post('/assign-orders', assignOrdersToDeliveryBoys);

router.get('/order/:orderId', getOrderDetails);
router.get('/downloadexcel', excelData);

// test
module.exports = router;