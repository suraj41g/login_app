
const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env
const secretKey = process.env.JWT_SECRET;
const otpGenerator = require('otp-generator')

/** POST: http://localhost:3000/api/register
 * @param : {
    "username" : "example123",
    "password" : "admin123",
    "email" : "example@gmail.com",
    "firstName" : "suraj",
    "lastName" : "gupta",
    "mobile" : "8210522541",
    "address" : "new chandmari motihari",
    "profile" : ""
}
 */
async function register(req, res) {

    try {
        const { username, password, profile, email } = req.body;
        if (!username || !password || !profile || !email) {
            res.status(400).json({ message: "all fields are mandatory" })
        }

        // Check for existing username
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already exists. Please choose a different username." });
        }

        // Check for existing email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already registered. Please use a different email." });
        }
        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const user = new User({
                username,
                password: hashedPassword,
                profile: profile || '',
                email
            });

            // Save the user
            const REGISTERED =await user.save();

            // Return success response
            return res.status(201).json({ message: "User registered successfully." , regiteredData:REGISTERED});
        } catch (error) {
            return Error
        }


    } catch (error) {
        return res.status(500).json({ error: error.message });
    }


};

/** POST: http://localhost:3000/api/login
 * @param : {
    "username" : "example123"
    "password" : "admin123"
}
 */
async function login(req, res) {

    const { username, password } = req.body;
    try {
        const findUser = await User.findOne({ username })
        if (!findUser) {
            res.status(404).json({ error: "User not Found" });
        }

        const checkPassword = await bcrypt.compare(password, findUser.password)
        if (!checkPassword) {
            res.status(400).json({ error: "Password is not matching" })
        } else {
            // Create JWT Token (defines a token for authentication) {1st rg= payload,2nd= secret,3rd=expiary time}
            const token = jwt.sign({
                userId: findUser._id,
                username: findUser.username
            }, secretKey, { expiresIn: "24h" })
            res.status(200).send({
                msg: " Login Successful",
                username: findUser.username,
                token
            });
        }

    } catch (error) {
        return res.status(404).json({ error: error.message });
    }

}

/** GET: http://localhost:3000/api/user/example.com */
async function getUser(req, res) {

    const { username } = req.params;

    try {

        const existingUser = await User.findOne({ username })
        if (!existingUser) {
            res.status(404).json({ message: "Username not Found" })
        } else {
            // filter password in sending data of user & mongoose return unecessary data with object, so convert it to json
            const { password, ...rest } = Object.assign({}, existingUser.toJSON());
            res.status(200).send(rest);
        }

    } catch (error) {

        return res.status(500).json({ message: "User not Found" });

    }
}

/** PUT: http://localhost:3000/api/updateuser
 * @param: {
  "id" : "<userid>"
 * }
  body: {
    firstName: "",
    lastName: "",
    address: "",
    profile: ""
  }
 */
async function updateUser(req, res) {
    // const id = req.params.id;
    const userId = req.user.userId; //  Access the user's ID from the decoded token
    const body = req.body; //Get the updated user data from the request body

    try {

        const updateData = await User.findById(userId);

        if (!updateData) {
            res.status(404).json({ message: "User not Found " })
        } else {
            updateData.set(body);  // If the user is found, update their data with the information from the request body

            await updateData.save();
            return res.status(201).json({ message: "Data Updated Successfully", updatedUser: updateData });

            // return res.status(201).json({ message: "Data Updated Successfully" })

        }

    } catch (error) {
        // console.error('Error in the updateUser function:', error);
        return res.status(500).json({ message: "Internal Server Error" })
    }

   
}

/** GET: http://localhost:3000/api/generateOTP */
async function generateOTP(req, res) {
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })

    res.status(201).send({ code: req.app.locals.OTP })

}

/** GET: http://localhost:3000/api/verifyOTP */
async function verifyOTP(req, res) {

    const { code } = req.query; //  This line extracts the code from the query parameters of the request. to be the OTP entered by the client.

    // Here, the function checks if the OTP stored in the req.app.locals.
    // OTP is equal to the OTP provided in the query parameters. 
    // Both values are first converted to integers for comparison.
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null; // indicating that the OTP has been used and cleared.
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({ message: "Verify Successful" })
    } else {
        return res.status(400).send({ message: "Inavalid Otp" })

    }
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:3000/api/createResetSession */
async function createResetSession(req, res) {

    if (req.app.locals.resetSession) {
        req.app.locals.resetSession = false; // allow access to this route only once
        return res.status(201).json({ message: "Access Granted" })
    } else {
        return res.status(440).send({ error: "Session Expired" })

    }
}

// update the password when we have valid session
/** PUT: http://localhost:3000/api/resetPassword */
async function resetPassword(req, res) {
    const { username, password } = req.body; // This line extracts the username and the new password from the request body.
    if(!req.app.locals.resetSession) return res.status(404).send({error:"session expired"})
    try {
        const findForReset = await User.findOne({ username },req.app.locals.resetSession= false) 
        if (findForReset) {

            const hashForReset = await bcrypt.hash(password, 10)
            await User.updateOne({ username }, { password: hashForReset });
            return res.status(201).json({ message: "Password updated successfully." })

        } else {
            return res.status(500).json({ message: " enable to update Password ." })
        }
    } catch (error) {
        console.error(error)
        return res.status(404).send({ error: "Username not Found" })
    }

}

async function logout(req,res){
}


module.exports = { register, login, getUser, updateUser, generateOTP, verifyOTP, createResetSession, resetPassword ,logout};