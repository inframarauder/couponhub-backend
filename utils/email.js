const nodemailer = require("nodemailer");
const ejs = require("ejs");

const getTransporter = (user) =>
  nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,

    auth: {
      user,
      pass: process.env.EMAIL_PASSWORD,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });

const getMailOptions = (from, to, subject, html) => ({
  from,
  to,
  subject,
  html,
});

exports.sendVerificationCode = async (name, email, code) => {
  const { EMAIL_VERIFY } = process.env;
  const transporter = getTransporter(EMAIL_VERIFY);
  try {
    const data = await ejs.renderFile(
      __dirname + "/email-templates/verification.ejs",
      {
        name,
        code,
      }
    );
    const mailOptions = getMailOptions(
      EMAIL_VERIFY,
      email,
      "SubSwap Verification Code",
      data
    );
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error in sending verification code\n", error);
  }
};

exports.sendReportMail = async (coupon, user, reason) => {
  const transporter = getTransporter(process.env.EMAIL_SUPPORT);
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
