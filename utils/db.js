const mongoose = require('mongoose');
require("dotenv").config(); 
const URI = process.env.MONGODB_URI;
// const { MONGODB_URI } = require("../config")

const connectDb = async()=>{
    try {
        await mongoose.connect (URI);
        console.log("Connection SuccessFul 👍");
       
    } 
    catch (error) {
        console.error("Database Connection Failed",error);
        process.exit(0);
    }
}

module.exports = connectDb;




