const express = require('express');
const router = express.Router();
const { addorder, vieworder,deleteorder, locationWiseOrder,allPincode,updateStatus,blockDate, fetchBlockedDates, unblockDate,fetchFullday } = require('../controllers/order_controller');

router.route("/addorder").post(addorder);
router.route("/vieworders").get(vieworder);
router.route("/deleteorder/:_id").delete(deleteorder);
router.route("/orderloaction").post(locationWiseOrder);
router.route("/allPincode").get(allPincode);
router.route("/updateStatus/:_id").put(updateStatus);

router.route("/block-date").post(blockDate);
router.post('/unblock-date',unblockDate);

router.route("/blocked-dates").get(fetchBlockedDates);


router.get('/fullday', fetchFullday);
module.exports = router;
