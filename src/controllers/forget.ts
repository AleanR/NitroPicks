import { AuthenticatedRequest } from "../helpers/auth";
import { getUserByEmail } from "../db/users";
import { Response } from 'express';
import { genResetToken } from "../helpers/index";
import dotenv from 'dotenv';
import { sendPassResetToken } from "../services/email";


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

        const resetURL = `http://localhost:8080/reset-password/${resetToken}`;

        await sendPassResetToken(user.email, resetURL);

        return res.json({
            message: "Reset token generated",
            resetURL,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error"});
    }
}

