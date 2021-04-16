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
      { name, code }
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
  const { EMAIL_SUPPORT } = process.env;
  const transporter = getTransporter(EMAIL_SUPPORT);
  try {
    const template =
      user.reports >= process.env.MAX_REPORTS
        ? "blacklisted.ejs"
        : "warning.ejs";

    const data = await ejs.renderFile(
      __dirname + `/email-templates/${template}`,
      { coupon, user, reason }
    );

    const mailOptions = getMailOptions(
      EMAIL_SUPPORT,
      user.email,
      "Report Alert!",
      data
    );

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error in sending report mail\n", error);
  }
};

exports.sendPasswordResetCode = async (email, code) => {
  const { EMAIL_SUPPORT } = process.env;
  const transporter = getTransporter(EMAIL_SUPPORT);
  try {
    const data = await ejs.renderFile(
      __dirname + `/email-templates/password-reset.ejs`,
      { email, code }
    );

    const mailOptions = getMailOptions(
      EMAIL_SUPPORT,
      email,
      "Password Reset Verification",
      data
    );

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error in sending password reset mail\n", error);
  }
};
