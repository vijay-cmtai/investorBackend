const sendEmail = require("../utils/mailer.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");

const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, city, inquiryType, budget, message } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !city ||
      !inquiryType ||
      !budget ||
      !message
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Invalid email format");
    }

    const adminEmailHtml = `
      <!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px;background-color:#f9f9f9}.header{background-color:#dc2626;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:white;padding:30px;border-radius:0 0 5px 5px}.field{margin-bottom:20px}.label{font-weight:bold;color:#dc2626}.value{margin-top:5px;padding:10px;background-color:#f3f4f6;border-radius:4px}.footer{text-align:center;margin-top:20px;color:#666;font-size:12px}</style></head><body><div class="container"><div class="header"><h2>🔔 New Property Inquiry</h2></div><div class="content"><div class="field"><div class="label">Name:</div><div class="value">${name}</div></div><div class="field"><div class="label">Email:</div><div class="value">${email}</div></div><div class="field"><div class="label">Phone:</div><div class="value">${phone}</div></div><div class="field"><div class="label">Inquiry Type:</div><div class="value">${inquiryType}</div></div><div class="field"><div class="label">Preferred City:</div><div class="value">${city}</div></div><div class="field"><div class="label">Budget Range:</div><div class="value">${budget}</div></div><div class="field"><div class="label">Message:</div><div class="value">${message}</div></div></div><div class="footer"><p>This email was sent from Investors Deaal contact form</p></div></div></body></html>
    `;

    const userEmailHtml = `
      <!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px;background-color:#f9f9f9}.header{background-color:#dc2626;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:white;padding:30px;border-radius:0 0 5px 5px}.footer{text-align:center;margin-top:20px;color:#666;font-size:12px}</style></head><body><div class="container"><div class="header"><h2>✅ Thank You for Your Inquiry!</h2></div><div class="content"><p>Dear ${name},</p><p>Thank you for your interest in Investors Deaal. We have received your property inquiry and our team of experts will contact you shortly to assist you further.</p><p><strong>Your Inquiry Details:</strong></p><ul style="padding-left: 20px;"><li><strong>Type:</strong> ${inquiryType}</li><li><strong>City:</strong> ${city}</li><li><strong>Budget:</strong> ${budget}</li></ul><p>Best regards,<br>Investors Deaal Team</p></div><div class="footer"><p>Investors Deaal | 123 Real Estate Avenue, New Delhi, India</p></div></div></body></html>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL || "admin@investorsdeaal.com",
      `New Property Inquiry from ${name} for ${inquiryType}`,
      adminEmailHtml
    );

    await sendEmail(
      email,
      "We've Received Your Property Inquiry | Investors Deaal",
      userEmailHtml
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Inquiry sent successfully! Our team will contact you soon."
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
