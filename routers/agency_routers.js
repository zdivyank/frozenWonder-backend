const express = require('express');
const router = express.Router();
const {add_agency,get_agency, upload, remove_agency} = require('../controllers/agency_controller');

router.post('/addagency',upload.single('logo') ,add_agency);
router.get('/getagency',get_agency);
router.delete('/removeagency/:_id',remove_agency);

module.exports = router;
