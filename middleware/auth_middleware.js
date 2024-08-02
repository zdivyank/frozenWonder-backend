const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const { JWT_KEY } = require("../config")

const authMiddleware = async (req, res, next) => {

    const token = req.header('Authorization');
    console.log(token);

    if (!token) {
        return res.status(401)
            .status(401)
            .json({ message: "Unauthorized HTTP, Token not provided" });

    }

    const jwtToken = token.replace("Bearer", '').trim();
    console.log(`jwtToken = ${jwtToken}`);

    try {
        const isVerified = jwt.verify(jwtToken, JWT_KEY);
        console.log(isVerified);

        const userData = await User.findOne({ email: isVerified.email }).select({
            password: 0,
        })
        // console.log(userData);

        req.token = token;
        req.users = userData;
        req.userID = userData._id;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }

}

module.exports = authMiddleware;