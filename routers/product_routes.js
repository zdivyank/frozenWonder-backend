const express = require('express');
const router = express.Router();
const { addproducts, viewproducts, upload, updateProduct, deleteproduct, singleproduct } = require('../controllers/product_controller');

router.route("/addproduct").post(upload.single('image'), addproducts);
router.route("/viewproducts").get(viewproducts);
router.route("/viewproducts/:_id").get(singleproduct);

router.route("/updateproduct/:_id").put(upload.single('image'), updateProduct);
router.route("/deleteproduct/:_id").delete(deleteproduct);
module.exports = router;
