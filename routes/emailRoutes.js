
const nodemailer = require("nodemailer");
const config = require("../config/dbConn");
const corsOptions = require("../config/corsOptions");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (req, res) => {
  const { to, subject, text } = req.body;

  // Prepare email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    text: text
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};

module.exports = {
  sendEmail
};
const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router.post("/send-email-to-patient", emailController.sendEmailToPatient);

module.exports = router;