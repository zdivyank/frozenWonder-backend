const express = require('express');
const router = express.Router();
const { addorder, vieworder,deleteorder, loactionWiseOrder,allPincode,updateStatus } = require('../controllers/order_controller');

router.route("/addorder").post(addorder);
router.route("/vieworders").get(vieworder);
router.route("/deleteorder/:_id").delete(deleteorder);
router.route("/orderloaction").post(loactionWiseOrder);
router.route("/allPincode").get(allPincode);

router.route("/updateStatus/:_id").put(updateStatus);
module.exports = router;
