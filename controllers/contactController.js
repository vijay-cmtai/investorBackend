const sendEmail = require("../utils/mailer.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");

const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      throw new ApiError(400, "All fields are required");
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Invalid email format");
    }

    // Admin email HTML template
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #4f46e5; }
            .value { margin-top: 5px; padding: 10px; background-color: #f3f4f6; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from Investors Deaal contact form</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // User confirmation email HTML
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Thank You for Contacting Us!</h2>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for reaching out to Investors Deaal. We have received your message and our team will get back to you within 24 hours.</p>
              <p><strong>Your message:</strong></p>
              <p style="padding: 15px; background-color: #f3f4f6; border-radius: 4px;">${message}</p>
              <p>Best regards,<br>Investors Deaal Team</p>
            </div>
            <div class="footer">
              <p>Investors Deaal | 123 Real Estate Avenue, New Delhi, India</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to admin
    await sendEmail(
      process.env.ADMIN_EMAIL || "admin@investorsdeaal.com",
      `New Contact Form Submission from ${name}`,
      adminEmailHtml
    );

    // Send confirmation email to user
    await sendEmail(
      email,
      "Thank you for contacting Investors Deaal",
      userEmailHtml
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Message sent successfully! We'll get back to you soon."
        )
      );
  } catch (error) {
    console.error("Contact form error:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to send message. Please try again later."
    );
  }
};

module.exports = { submitContactForm };
