const nodemailer = require("nodemailer");
const User = require("../models/User");

const sendLowScoreAlert = async (candidate) => {
  try {
    // Find all admin emails
    const admins = await User.find({ role: "admin" });
    const adminEmails = admins.map((admin) => admin.email);

    if (adminEmails.length === 0) {
      console.log("No administrators found in DB to send low score alert.");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });

    const mailOptions = {
      from: '"Reliabilix Alerts" <alerts@reliabilix.com>',
      to: adminEmails.join(","),
      subject: `⚠️ ALERT: Low Reliability Score - ${candidate.name}`,
      html: `
        <h2>Reliability Alert</h2>
        <p>A candidate's reliability score has fallen below 50.</p>
        <hr />
        <ul>
          <li><strong>Name:</strong> ${candidate.name}</li>
          <li><strong>Email:</strong> ${candidate.email}</li>
          <li><strong>Roll Number:</strong> ${candidate.rollNumber}</li>
          <li><strong>Department:</strong> ${candidate.department}</li>
          <li><strong>Reliability Score:</strong> ${candidate.reliabilityScore} (${candidate.grade})</li>
        </ul>
        <hr />
        <p>Please log in to the dashboard to review this candidate.</p>
      `,
    };

    // If SMTP user is not set, log the email content
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("====================================================================");
      console.log(`[SMTP Not Configured] Low Score Alert Email would be sent to: ${adminEmails.join(", ")}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Candidate: ${candidate.name} | Score: ${candidate.reliabilityScore} | Grade: ${candidate.grade}`);
      console.log("====================================================================");
      return;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Low score email alert sent: ${info.messageId}`);
  } catch (error) {
    console.error("Failed to send low score alert email:", error);
  }
};

module.exports = { sendLowScoreAlert };
