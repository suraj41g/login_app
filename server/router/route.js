const express = require('express');
const router = express.Router();
// import all controllers
const {register,login,getUser,updateUser,generateOTP,verifyOTP,createResetSession,resetPassword,logout} = require('../controllers/appController')
const { Auth,localVariables,verifyUser} = require('../middleware/auth');
const registerMail = require('../controllers/mailer');

/** Post Method */
router.route('/register').post(register);
router.route('/registerMail').post(registerMail); // send the email after login with otp
// router.route('/authentication').post((req,res) => res.end()); // authenticate user
router.route('/login').post(login); // login in app

/** Get Method */
router.route('/user/:username').get(getUser); // user with username
router.route('/generateOtp').get(verifyUser,localVariables,generateOTP); // generate random otp
router.route('/verifyOtp').get(verifyOTP); // verify generated otp
router.route('/createResetSession').get(createResetSession); // reset all the variables
router.route('logout').get(logout);

/** Put Method */
router.route('/updateuser').put(Auth,updateUser); // to upadte the user profile
router.route('/resetPassword').put(resetPassword); // to reset password



module.exports = router;