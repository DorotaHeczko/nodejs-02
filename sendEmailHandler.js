
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();



const secretKey = process.env.MAILER;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "dorotagoit@gmail.com",
    pass: secretKey,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


const sendEmail = (email, url) => {
  const mailOptions = {
    to: email,
    from: "dorotagoit@gmail.com",
    subject: "Email verification",
    text: `Verify your email by clicking on the link - ${url}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent", info.response);
    }
  });
};


module.exports = {
  sendEmail,
};
