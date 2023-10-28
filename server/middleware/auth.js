const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../model/userModel');



/** auth middleware for verifyong user */
const Auth = async function (req, res, next) {
    try {
        
        // This line extracts the JWT token from the Authorization header of the incoming request. 
        //It assumes that the header is in the format "Bearer <token>" and uses the .split(" ") method to separate the "Bearer" keyword from the actual token. 
        //The token itself is stored in the token variable.
        const token = req.headers.authorization.split(" ")[1]; 

        // The extracted token is then verified using the jwt.verify function. 
        //This function decodes and validates the JWT token using a secret key (process.env.JWT_SECRET).
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

       
        // If the token is successfully verified, the decoded user information is attached to the req object as req.user.
        // This allows subsequent routes or middleware to access information about the authenticated user.
        req.user = decodedToken;
        next()

    } catch (error) {
        res.status(401).json({ message: "Authentication Failed" })
    }
};

const localVariables = async function (req, res, next) {
    req.app.locals = {
        OTP: null,
        resetSession: false
    }
    next()
}


const verifyUser = async function (req, res, next) {
    try {
        // This line extracts the username from the request based on the HTTP method. 
        //If the request method is GET, it extracts the username from the query parameters (req.query), and if it's not a GET request, it extracts it from the request body (req.body).
        // This allows the middleware to handle both GET and non-GET requests for user verification.
        const { username } = req.method == "GET" ? req.query : req.body;

        let exist = await User.findOne({ username });
        if (!exist) {
            return res.status(404).send({ error: "Can't find user" })
        } else {
            // console.log("not verified");
            next();
        }

    } catch (error) {

        return res.status(404).send({ message: "Authentication Failed for verify user" })
    }
}




module.exports = { Auth, localVariables, verifyUser };