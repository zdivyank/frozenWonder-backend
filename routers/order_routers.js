const express = require('express');
const router = express.Router();
const { 
  addorder, 
  vieworder,
  viewvalidorders,
  viewarchivedorders,
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
  excelData,
  availableDate,
  filterOrders,
  editorder
} = require('../controllers/order_controller');

router.route("/addorder").post(addorder);
router.route("/vieworders").get(vieworder);
router.route("/viewvalidorders").get(viewvalidorders);
router.route("/viewarchivedorders").get(viewarchivedorders);
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
router.put('/editorder/:_id',editorder); 


router.post('/updateAssignedOrders', updateAssignedorder);
router.post('/assign-orders', assignOrdersToDeliveryBoys);

router.get('/order/:orderId', getOrderDetails);

router.get('/downloadexcel', excelData);
router.get('/available-dates', availableDate);
router.get('/filter-orders', filterOrders);

// test
module.exports = router;