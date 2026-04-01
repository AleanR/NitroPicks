
import { Request, Response } from "express";
import crypto from 'crypto';
import { getUserbyToken } from "../db/users";
import { hashPassword } from "../helpers/index";

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
