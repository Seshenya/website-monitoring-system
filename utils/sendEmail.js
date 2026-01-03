import "../config/env.js";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, text, html = null) {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject,
      text,
      html,
    };
    await sgMail.send(msg);
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
}
