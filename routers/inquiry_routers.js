const express = require('express');
const router = express.Router();
const {add_inquiry, get_inquiry, remove_inquiry,edit_inquiry } = require('../controllers/inquiry_controller');

router.post('/addinquiry',add_inquiry);
router.get('/getinquiry',get_inquiry);
router.delete('/removeinquiry/:_id',remove_inquiry);

router.put('/editinquiry/:_id',edit_inquiry);
module.exports = router;
