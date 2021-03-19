const nodemailer = require("nodemailer");

//nodemailer setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

exports.sendVerificationCode = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "CouponHub Verification Code",
      html: `
			<div>
        <h3>CouponHub</h3>
        <hr/>
				<p>
					Thank you for using CouponHub.<br/>
					Enter the following code to verify your account - <br/>
          <h2>${code}</h2> 
				</p>
        <hr/>
      </div>
			`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};
