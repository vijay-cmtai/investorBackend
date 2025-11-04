// utils/mailer.js

const nodemailer = require("nodemailer");
const { ApiError } = require("./ApiError.js");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_PORT == 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Investor Deal" <${process.env.MAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`✅ Email sent successfully to ${to}.`);
  } catch (error) {
    console.error("❌ Error sending email via Nodemailer:", error);
    throw new ApiError(500, "Failed to send email. Please check server logs.");
  }
};

module.exports = sendEmail;
