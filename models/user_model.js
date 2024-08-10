const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Define the user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles', 
        required: true,
    },
    agency_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agencies', 
        required: true,
    },
    user_type: {
        type: String,
        required: true,
        enum: ["Admin", "Agency", "Delivery_person"], 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Method to compare passwords
userSchema.methods.comparePass = async function(password) {
    return bcrypt.compare(password, this.password);
}

// Method to generate JWT token
userSchema.methods.generateToken = async function() {
    try {
        return jwt.sign(
            {
                userId: this._id.toString(),
                email: this.email,
                isAdmin: this.user_type === 'ADMIN', // Determine if the user is an admin
            },
            process.env.JWT_KEY, // Ensure that JWT_KEY is set in your environment variables
            { expiresIn: "30d" } // Token expiration time
        );
    } catch (error) {
        console.error('Token generation failed:', error);
        throw new Error('Token generation failed');
    }
};


const User = mongoose.model("users", userSchema);

module.exports = User;
