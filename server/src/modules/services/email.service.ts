import { createTransport } from "nodemailer";
import dotenv from 'dotenv';


dotenv.config();

export const sendPassResetToken = async (userEmail: string, url: string) => {
    const transporter = createTransport({
            service: "Gmail",
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            },
        });

    await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: userEmail,
            subject: "Password Reset Token",
            html: `<p>Please click on this <a href="${url}">here</a> to reset your password. This link is valid for 15 minutes.</p>`,
    });
}


export const sendEmailVerifOTP = async (userEmail: string, url: string) => {

    const transporter = createTransport({
            service: "Gmail",
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            },
        });

    await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: userEmail,
            subject: "Email Verification OTP",
            html: `
            <h2>Email Verification</h2>
            <p>Click below to verify your account:</p>
            <a href=${url}>Verify</a>
            `,
    });
}