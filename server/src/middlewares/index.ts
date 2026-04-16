import { Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwt';
import { AuthenticatedRequest } from '../helpers/auth';
import { getUserById } from '../modules/users/users.model';

// Intermediate function to authenticate user id & email in each request
export const isAuthenticated = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(401).json({ message: "Invalid or expired token!"});
    }
}

// Intermediate function to validate user role in each request
export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await getUserById(req.user.id);

        if (user!.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(401).json({ message: "Invalid role" });
    }
}