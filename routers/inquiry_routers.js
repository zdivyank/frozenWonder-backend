const express = require('express');
const router = express.Router();
const {add_inquiry, get_inquiry,getarchivedinquiry,edit_status, remove_inquiry,edit_inquiry,downloadInquiries } = require('../controllers/inquiry_controller');

router.post('/addinquiry',add_inquiry);
router.get('/getinquiry',get_inquiry);
router.get('/getarchivedinquiry',getarchivedinquiry);
router.delete('/removeinquiry/:_id',remove_inquiry);

router.put('/editinquiry/:_id',edit_inquiry);
router.put('/edit_status/:_id',edit_status);
router.get('/downloadInquiries',downloadInquiries);
module.exports = router;
