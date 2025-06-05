const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_SENDER,       // your Gmail address
    pass: process.env.EMAIL_PASSWORD      // your app password
  }
});

exports.sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: '"LumiVote" <no-reply@lumivote.com>',
    to: email,
    subject: 'Your LumiVote OTP Code',
    text: `Your OTP is: ${otp}. It expires in 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
};
