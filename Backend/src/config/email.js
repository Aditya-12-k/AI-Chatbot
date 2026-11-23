import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

// Gmail OAuth2 transporter
const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
});

// Verify Gmail SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.error("Gmail SMTP Error:", error);
    } else {
        console.log("Gmail SMTP is ready to send emails");
    }
});

export default transporter;