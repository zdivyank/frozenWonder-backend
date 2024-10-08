require('dotenv').config();
const express = require("express");
const app = express();
const cors = require('cors');
const connectDb = require('./utils/db')
const productRoute = require('./routers/product_routes')
const orderRoute = require('./routers/order_routers')
const userRoute = require('./routers/user_routers')
const otpRoute = require('./routers/otp_routers')
const tesimonailRoute = require('./routers/tesimonails_routers')
const roleRoute = require('./routers/role_routers')
const agencyRoute = require('./routers/agency_routers')
const couponRoute = require('./routers/coupon_routers')
const deliveryRoute = require('./routers/delivery_routers')
const inquiryRoute = require('./routers/inquiry_routers')
const videoRoute = require('./routers/video_routers')
const path = require('path');
const bodyParser = require('body-parser');


// app.use(cors({
//   origin: ['http://localhost:5173','https://frozenwonder-frontend.onrender.com','https://frozenwonders.netlify.app/']
// }));

// const corsOptions = {
//   origin: ['https://frozenwonders.netlify.app','http://frozenwonders.in','https://frozenwonders.in',],  // Allow only your frontend domain
//   methods: 'GET,POST,PUT,DELETE',
//   optionsSuccessStatus: 204,
// };

// app.use(cors(corsOptions)); 
app.use(cors()) ;

// const corsOptions = {
//   origin: ['https://frozenwonders.in','http://localhost:5173'], // replace with your frontend domain
//   optionsSuccessStatus: 200
// };

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// app.use(cors(corsOptions));


app.use(bodyParser.json());


app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/',userRoute);
app.use('/',otpRoute);
app.use('/',productRoute);
app.use('/',orderRoute);
app.use('/',tesimonailRoute);
app.use('/',roleRoute);
app.use('/',agencyRoute);
app.use('/',couponRoute);
app.use('/',deliveryRoute);
app.use('/',inquiryRoute);
app.use('/',videoRoute);
// app.use("/api/blog", blogRouter);


connectDb().then(app.listen(8001, () => {
    console.log(`server running on port 8001 👍`);
  }))


module.exports = app