const user = require("../models/user_model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const register = async (req, res) => {
    try {
        const { username, email, phone, password,role } = req.body;
        //first email database mathi
        //second email uper thi☝️
        // const userExist = await user.findOne({email : email})

        const userExist = await user.findOne({ email })
        if (userExist) {
            return res.status(400).json({ msg: "Already Registerd.." })
        }

        //bycrpt password...
        var salt = bcrypt.genSaltSync(10);
        var hash_Password = await bcrypt.hash(password, salt);
        // await user.create({username ,email,phone ,password})
        const newUser = await user.create({ username, email, phone, password: hash_Password,role });
        console.log(newUser);
        return res.status(200)
            .json({
                // msg : newUser ,
                msg: "Registration Successful",
                token: await newUser.genrateToken(),
                userId: newUser._id.toString()
            })
    }
    catch (error) {
        console.log(error);
        return res.status(500)
            .send("Oops Not Found");
    }
}


// *-----------------------------------------
// *-----------------------------------------

//  Login Logic 💯

// *-----------------------------------------
// *-----------------------------------------

const login = async (req, res) => {

    try {
        const { email, password } = req.body;
        const userExist = await user.findOne({ email })

        if (!userExist) {
            return res.status(400).json({ message: "invalid credentials " });
        }

        //compare password
        const passwordMatch = await userExist.comparePass(password);

        if (passwordMatch) {
            return res.status(200)
                .json({
                    message: "Login Succesful",
                    token: await userExist.genrateToken(),
                    userId: userExist._id.toString()
                })
        }
        else {
            return res.status(401)
                .json({
                    message: "Invalid Email Or Password",
                })
        }

    } catch (error) {
        // res.status(500)
        // .json("Internal Error");
        // console.log(error);
        const status = 500;
        const message = "Internal Error";
        const extraDetails = err.errors[0].message;
        const err = {
            status,
            message,
            extraDetails
        }
        next(err)
    }
}

const users = async (req, res) => {

    try {
        const userData = req.users;
        console.log(userData);
        return res.status(200).json({ userData });
    } catch (error) {
        console.log(`error from user route${error}`);
    }

}

module.exports = { register, login,users}