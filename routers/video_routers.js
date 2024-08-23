const express = require('express');
const router = express.Router();
const { upload, addvideo, getvideo, updatevideo, deletevideo } = require('../controllers/video_controller');

router.post('/addvideo', upload.single('video'), addvideo);
router.get('/getvideo', getvideo);
router.put('/updatevideo/:_id', upload.single('video'), updatevideo);
router.delete('/deletevideo/:_id', deletevideo);

module.exports = router;
