const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env

/** POST: http://localhost:3000/api/registerMail
 * @param : {
    "username" : "example123"
    "userEmail" : "admin123",
    "text" : "",
    "subject" : ""
}
 */
async function registerMail(req, res) {

    // Create a transporter using SMTP or some other transport mechanism
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service, e.g., 'Gmail', 'SMTP', etc.
        // host:'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL, // sender email
            pass: process.env.PASSWORD // sender password
        }
    })
    const { username, userEmail, text, subject } = req.body;
    // Email data
    const mailOptions = {
        from: process.env.EMAIL, // sender email
        to: userEmail, // user email
        subject: subject ||'Login App ',
        text: text ||'Thanks for signup ! , Happy to serve You'
    };

// Send the email
try {
    const sendEmail = await transporter.sendMail(mailOptions)
    if(sendEmail){
       
        res.status(201).json({message: "sucessfully"})
    }else{
        res.status(404).json({ message: "not snet"})
        console.log('Email not sent');
    }

  
} catch (error) {
    console.error(error)
    return res.status(500).send({error:"email sending failed"})
}










}








module.exports = registerMail;