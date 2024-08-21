require("dotenv").config(); 
module.exports = {
    MONGODB_URI:process.env.MONGODB_URI,
    JWT_KEY:process.env.JWT_KEY,
    CLOUD_NAME:process.env.CLOUD_NAME,
    API_KEY:process.env.API_KEY,
    API_SECRET:process.env.API_SECRET,
    EMAIL_USER:process.env.EMAIL_USER,
    EMAIL_PASS:process.env.EMAIL_PASS,
}