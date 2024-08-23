const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  video: {
    type: String,
    required: true,
  }
 
});

module.exports = mongoose.model('videos', videoSchema);
