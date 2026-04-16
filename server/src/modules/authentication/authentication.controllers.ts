import { Request, Response } from 'express';
import { createUser, getUserByEmail, getUserById, UserModel } from '../users/users.model';
import { comparePassword, hashPassword } from '../../helpers';
import { createToken, verifyToken } from '../../helpers/jwt';
import { sendEmailVerifOTP } from '../services/email.service';
import { AuthenticatedRequest } from '../../helpers/auth';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required!"});
        }

        const user = await getUserByEmail(email).select('+authentication.password');

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials!"});
        }

        const isMatch = await comparePassword(password, user.authentication!.password);

        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials!"});

        if (user.isVerified === false) {
            return res.status(403).json({
                message: "Please verify your email before signing in.",
            });
        }
        
        const token = await createToken(user._id.toString(), user.email);

        // Create cookie to hold the logged-in token
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 3600000,
        });

        const safeUser = await getUserByEmail(email);   // Don't select and return the password after valid authentication

        return res.status(200).json({
            ...safeUser!.toObject(),
            isAdmin: user.role === 'admin',
            token,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error"});
    }
}

export const register = async (req: Request, res: Response) => {
    try {
        const { firstname, lastname, ucfID, major, email, password, username } = req.body;

        if (!firstname || !lastname || !ucfID || !major || !email || !password || !username) {
            return res.status(400).json({ message: "Missing required field(s)"});
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long"});
        }

        const existingUser = await UserModel.findOne({
            $or: [{ email }, { ucfID }, { username }]
        });
        
        if (existingUser) {
            return res.status(409).json({ message: "User with provided email, username or UCF ID already exists" });
        }

        // Validate emails to only be @ucf.edu
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain !== "ucf.edu"){
            return res.status(400).json({ message: "Email must have @ucf.edu domain" });
        }

        const hashedPass = await hashPassword(password);

        const isProduction = !!process.env.CLIENT_URL;

        const user = await createUser({
            firstname,
            lastname,
            ucfID,
            major,
            knightPoints: 1000,
            email,
            isVerified: !isProduction,
            username,
            authentication: {
                password: hashedPass,
            },
        });

        const token = await createToken(user._id.toString(), user.email);

        if (isProduction) {
            const otpUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
            await sendEmailVerifOTP(user.email, otpUrl);
            return res.status(201).json({
                message: "Email Verification OTP Sent!",
                token,
            });
        }

        return res.status(201).json({
            message: "Account created successfully!",
            token,
        });
            
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error"});
    }
}

export const logout = async (req: Request, res: Response) => {
    // Clear token cookies once logged-out
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    });

    return res.status(200).json({ message: "User logged out successfully" });
}

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

export const resendVerification = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authenticated" });

        const user = await getUserById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isVerified) {
            return res.status(400).json({ message: "Account is already verified." });
        }

        const token = await createToken(user._id.toString(), user.email);
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

        await sendEmailVerifOTP(user.email, verifyUrl);

        return res.status(200).json({ message: "Verification email sent." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
