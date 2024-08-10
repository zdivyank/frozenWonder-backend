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
  addaddress
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

module.exports = router;