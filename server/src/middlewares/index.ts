import { Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwt';
import { AuthenticatedRequest } from '../helpers/auth';


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