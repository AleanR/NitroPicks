import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET;

export const createToken = async (userId: string, userEmail: string) => {
    return jwt.sign({ id: userId, email: userEmail }, SECRET!, {
        expiresIn: "7d",
    });
};

export const verifyToken = async (token: string) => {
    return jwt.verify(token, SECRET!) as { id: string, email: string };
};