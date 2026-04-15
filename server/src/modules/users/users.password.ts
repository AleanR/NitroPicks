import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../helpers/auth";
import { getUserByEmail, getUserbyToken } from "./users.model";
import { genResetToken, hashPassword } from "../../helpers/index";
import { sendPassResetToken } from "../services/email.service";

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export const forgotPass = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { email } = req.body;

        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "User not found "});
        }

        const { resetToken, hashed } = await genResetToken();

        user.authentication.resetPasswordToken = hashed;
        user.authentication.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetURL = `${clientUrl}/reset-password/${resetToken}`;

        await sendPassResetToken(user.email, resetURL);

        return res.json({ message: "Reset link sent to your email." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error"});
    }
}

export const resetPass = async (req: Request, res: Response) => {
    try {

        const { token } = req.params;

        if (!token || Array.isArray(token)) {
            return res.status(400).json({ message: "Token required to change password"});
        }
        const { password } = req.body;

        const hashedToken = crypto.createHash("sha256").update(token).digest('hex');


        const user = await getUserbyToken({
            "authentication.resetPasswordToken": hashedToken,
            "authentication.resetPasswordExpires": { $gt: new Date() },
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const hashedPass = await hashPassword(password);

        user.authentication.password = hashedPass;

        user.authentication.resetPasswordToken = undefined;
        user.authentication.resetPasswordExpires = undefined;

        await user.save();

        return res.json({ message: "Password updated successfully!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error"});
    }
}
