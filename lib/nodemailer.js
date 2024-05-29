import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendWelcomeEmail = async (to, password, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Welcome to the Book Warden",
    html: `<p>Hello ${name},</p>
        <p>Your librarian account has been successfully created!</p>
            <p>Your password is: <strong>${password}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

export default sendWelcomeEmail;
