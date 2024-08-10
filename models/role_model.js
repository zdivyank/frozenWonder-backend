const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
      },
});


const role = mongoose.model("roles", roleSchema);

module.exports = role;
