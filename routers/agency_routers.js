const express = require('express');
const router = express.Router();
const {add_agency,get_agency, upload,get_Eachagency, remove_agency, edit_agency} = require('../controllers/agency_controller');

router.post('/addagency',upload.single('logo') ,add_agency);
router.get('/getagency',get_agency);
router.delete('/removeagency/:_id',remove_agency);
router.put('/editagency/:_id',edit_agency);
router.post('/eachagency/:_id',get_Eachagency);
module.exports = router;
