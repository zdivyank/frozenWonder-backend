require('dotenv').config();
const express = require("express");
const app = express();
const cors = require('cors');
const connectDb = require('./utils/db')
const productRoute = require('./routers/product_routes')
const orderRoute = require('./routers/order_routers')
const userRoute = require('./routers/user_routers')
const otpRoute = require('./routers/otp_routers')
const path = require('path');

// app.use(cors({
//   origin: ['http://localhost:5173','https://frozenwonder-frontend.onrender.com','https://frozenwonders.netlify.app/']
// }));

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://frozenwonders.netlify.app/"); // Update this to your frontend URL
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/',userRoute);
app.use('/',otpRoute);
app.use('/',productRoute);
app.use('/',orderRoute);
// app.use("/api/blog", blogRouter);


connectDb().then(app.listen(8000, () => {
    console.log(`server running on port 8000 👍`);
  }))


module.exports = app