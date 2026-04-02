import { Request, Response } from 'express';
import { verifyToken } from '../helpers/jwt';
import { getUserById } from '../db/users';



export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            return res.status(401).json({ message: "Invalid token" });
        }

        const decoded = await verifyToken(token);

        const user = await getUserById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isVerified = true;
        await user.save();

        return res.json({ message: "Email verified successfully" });

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Token expired or invalid" });
    }
}
