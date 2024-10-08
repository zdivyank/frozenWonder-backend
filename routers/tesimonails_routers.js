const express = require('express');
const router = express.Router();
const { upload, addTestimonails,getVerifiedtestimonail, getTestimonails,updateTestimonails ,deleteTestimonails} = require('../controllers/tesimonail_controller');

router.post('/addtestimonail', upload.single('image'), addTestimonails);
router.get('/gettestimonail', getTestimonails);
router.get('/getVerifiedtestimonail', getVerifiedtestimonail);
router.put('/updatetestimonail/:_id', upload.single('image'), updateTestimonails);
router.delete('/deletetestimonail/:_id', deleteTestimonails);

module.exports = router;
