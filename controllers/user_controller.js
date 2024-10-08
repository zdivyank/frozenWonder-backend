    const user = require("../models/user_model");
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const mongoose = require('mongoose')

    const register = async (req, res) => {
        try {
            const { username, email, phone, password, role, agency_id } = req.body;
    
            // Log the received data to check if it's coming correctly
            console.log("Register data:", { username, email, phone, role, agency_id  });
    
            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(role) || !mongoose.Types.ObjectId.isValid(agency_id)) {
                return res.status(400).json({ msg: "Invalid role or agency_id" });
            }
    
            // Check if the user already exists
            const userExist = await user.findOne({ email });
            if (userExist) {
                return res.status(400).json({ msg: "Already Registered.." });
            }
    
            // Hash the password
            var salt = bcrypt.genSaltSync(10);
            var hash_Password = await bcrypt.hash(password, salt);
    
            // Create the new user
            const newUser = new user({
                username,
                email,
                phone,
                password: hash_Password,
                role: mongoose.Types.ObjectId(role), // Pass the role ObjectId
                agency_id: mongoose.Types.ObjectId(agency_id) // Pass the agency ObjectId
                
            });
    
            console.log("New user before save:", newUser);
    
            await newUser.save();
    
            console.log("New user after save:", newUser);
    
            // Generate token and respond
            return res.status(200).json({
                msg: "Registration Successful",
                token: await newUser.generateToken(),
                userId: newUser._id.toString()
            });
        } catch (error) {
            console.log("Error during registration:", error);
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ msg: "Validation failed", errors: validationErrors });
            }
            return res.status(500).json({ msg: "Oops Not Found", error: error.message });
        }
    }

    const login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const userExist = await user.findOne({ email });



            if (!userExist) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            // Compare the password
            const passwordMatch = await userExist.comparePass(password);

            if (passwordMatch) {
                return res.status(200).json({
                    message: "Login Successful",
                    token: await userExist.generateToken(),  // Corrected method name
                    userId: userExist._id.toString()
                });
            } else {
                return res.status(401).json({
                    message: "Invalid Email Or Password",
                });
            }

        } catch (error) {
            console.log("Error during login:", error);  // Log the error details
            return res.status(500).json({ msg: "Internal Error", error: error.message });
        }
    }

    const users = async (req, res) => {
        try {
            const userData = req.users;
            console.log(userData);
            return res.status(200).json({ userData });
        } catch (error) {
            console.log(`Error from user route: ${error}`);
        }
    }

    const allUser = async(req,res)=>{
        try {
                const response = await user.find().populate('role','name');
                console.log(response);

                return res.status(200).json({response})
                

        } catch (error) {
            console.log(error);
            
            res.status(500).json({"message":error})
        }
    }


    const fetch_role = async (req, res) => {
        try {
            const { _id } = req.body;
    
            const userWithRole = await user.findById(_id).populate('role', 'name');
    
            if (!userWithRole) {
                return res.status(404).json({ message: "User not found" });
            }
    
            console.log(userWithRole.role.name);
    
            return res.status(200).json({ role: userWithRole.role.name });
        } catch (error) {
            console.log('Error fetching current user details:', error);
            return res.status(500).json({ message: "Server error" });
        }
    };
    
    module.exports = { register, login, users ,allUser,fetch_role};
