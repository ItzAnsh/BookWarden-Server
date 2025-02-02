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

const sendIssueStatusEmail = async (to, issue) => {
  // Determine the book title
  const bookTitle = issue.bookId.title;

  // Generate the email content
  const htmlContent = `
    <p>Hello ${issue.userId.name},</p>
    <p>Your book <strong>${bookTitle}</strong> has been ${issue.status}.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Book Issue Status",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Issue status email sent successfully");
  } catch (error) {
    console.error("Error sending issue status email:", error);
  }
};

const sendRequestStatusEmail = async (to, request) => {
  // Determine the book title
  const bookTitle = request.bookId.title;

  // Generate the email content
  const htmlContent = `
    <p>Hello ${request.librarianId.name},</p>
    <p>Your request for book <strong>${bookTitle}</strong> of quantity ${request.quantity} has been ${request.status}.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Request Status",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Request status email sent successfully");
  } catch (error) {
    console.error("Error sending request status email:", error);
  }
};


export {sendWelcomeEmail, sendIssueStatusEmail, sendRequestStatusEmail};
