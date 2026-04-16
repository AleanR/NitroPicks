import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET;

// Create verification token once registered
export const createToken = async (userId: string, userEmail: string) => {
    return jwt.sign({ id: userId, email: userEmail }, SECRET!, {
        expiresIn: "7d",
    });
};

// Decrypt and verify token to get id & email
export const verifyToken = async (token: string) => {
    return jwt.verify(token, SECRET!) as { id: string, email: string };
};