const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username : {
        type : String,
        required : [true, "Please provide unique Username"],
        unique : [true, "Username Exist"],
    },
    password : {
        type : String,
        required : [true, "Please provide a Password"],
        unique : false,
    }, 
    email : {
        type : String,
        required : [true, "Please provide unique Email"],
        unique : true,
    },
    firstName : { type: String},
    lastName : { type: String},
    mobile : { type: Number},
    address : { type: String},
    profile : { type: String}
});

const User =mongoose.model('User', UserSchema);

module.exports = User;