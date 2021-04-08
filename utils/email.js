const nodemailer = require("nodemailer");

exports.sendVerificationCode = async (email, code) => {
  //nodemailer setup
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,

    auth: {
      user: process.env.EMAIL_VERIFY,
      pass: process.env.EMAIL_PASSWORD,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_VERIFY,
    to: email,
    subject: "SubSwap Verification Code",
    html: `
    <div>
      <h3>SubSwap</h3>
      <hr/>
      <p>
        Thank you for using SubSwap.<br/>
        Enter the following code to verify your account - <br/>
        <h2>${code}</h2> 
      </p>
      <hr/>
    </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};

exports.sendReportMail = async (coupon, user, reason) => {
  //nodemailer setup

  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,

    auth: {
      user: process.env.EMAIL_SUPPORT,
      pass: process.env.EMAIL_PASSWORD,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_SUPPORT,
    to: user.email,
    subject: "You have been reported",
    html: `
    <div>
      <p>Dear ${user.name},</p>
      <p>
        A user on our platform reported the following coupon posted by you:<br/>
       <strong> ${coupon._id} </strong><br/>
       for the following reason:<br/>
       <strong>${reason}</strong>
      </p>
      ${
        user.reports < process.env.MAX_REPORTS
          ? `<p> You have now been reported ${user.reports} out of ${process.env.MAX_REPORTS} times. As per our community guidelines, we have deleted the coupon from our database and deducted one credit from your account.<br/>
      If your account had zero credits, it now has negative credits. You can increase your credits by posting valid coupons.<br/>
      <strong>Please note that once your account gets reported ${process.env.MAX_REPORTS} times, you shall be blacklisted and access to your account shall be resticted until further notice.</strong>
      </p>`
          : `<p> 
          You have now been reported ${user.reports} out of ${process.env.MAX_REPORTS} times.<br/>
          Your account has been blacklisted and access to the same shall remain restricted until further notice.
         </p>`
      }
      
      <p>If you think this was a mistake and you have been wrongfully penalised, please write to us at support@subswap.space.</p>
      <p>
        Regards,<br/>
        Team SubSwap
      </p>
      <hr/>
    </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};
