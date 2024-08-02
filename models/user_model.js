const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const { JWT_KEY } = require("../config")

const userSchema = new mongoose.Schema({
    username : {
        type : "string",
        required : true,
    },

    email : {
        type : "String",
        required : true,
    },

    phone : {
        type : "String",
        required : true,
    },

    password : {
        type : "String",
        required : true,
    },

    role : {
        type : String,
        // default : "",
        required:true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

    //compare password here and calling there in cntrl
    userSchema.methods.comparePass = async function(password){
    return bcrypt.compare(password,this.password);
    }

//jwt

userSchema.methods.genrateToken = async function(){
try {
   return jwt.sign({
        userId : this._id.toString(),
        email: this.email,
        isAdmin : this.isAdmin, 
    },
    process.env.JWT_KEY,
   { expiresIn : "30d"}
    )
} catch (error) {
    console.error(error)
}
};

//define collection name

const user = new mongoose.model("users",userSchema);

module.exports = user;  