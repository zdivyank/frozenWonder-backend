const express = require('express');
const router = express.Router();
const { addorder, vieworder,deleteorder } = require('../controllers/order_controller');

router.route("/addorder").post(addorder);
router.route("/vieworders").get(vieworder);
router.route("/deleteorder/:_id").delete(deleteorder);

module.exports = router;
