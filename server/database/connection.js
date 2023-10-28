const mongoose = require('mongoose');

async function connect(){
 const db = mongoose.connect('mongodb://127.0.0.1:27017/login_app')
 .then( () => {
    console.log("Connected to Mongodb Database")
    return(db)
    .catch(err => console.log(" Not Connected to Mongodb"))
 })
};

module.exports = connect;