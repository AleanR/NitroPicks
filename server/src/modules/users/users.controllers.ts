import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../../helpers/auth';
import { deleteUserById, getUsers, updateUserById, UserModel, getUserById } from './users.model';
import { Request, Response } from 'express';
import { sendSupportEmail } from '../services/email.service';
import { BetModel } from '../bets/bets.model';


export const getPublicUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const user = await getUserById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            major: user.major,
            knightPoints: user.knightPoints,
            createdAt: (user as any).createdAt,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isAdmin = user.role === 'admin';
        return res.status(200).json({ ...user.toObject(), isAdmin });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUsers();
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const [users, betStats] = await Promise.all([
            getUsers(),
            BetModel.aggregate([
                { $match: { status: { $in: ['win', 'lose', 'active', 'refunded'] } } },
                {
                    $group: {
                        _id: '$userId',
                        total: { $sum: 1 },
                        wins: { $sum: { $cond: [{ $eq: ['$status', 'win'] }, 1, 0] } },
                    }
                }
            ])
        ]);

        const statsMap = new Map<string, { total: number; wins: number }>();
        for (const s of betStats) {
            statsMap.set(s._id.toString(), { total: s.total, wins: s.wins });
        }

        const leaderboard = users
            .filter((u: any) => u.username !== 'admin')
            .sort((a: any, b: any) => (b.knightPoints || 0) - (a.knightPoints || 0))
            .slice(0, 10)
            .map((user: any, index: number) => {
                const stats = statsMap.get(user._id.toString()) ?? { total: 0, wins: 0 };
                const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
                return {
                    id: user._id,
                    name: `${user.firstname || user.firstName} ${user.lastname || user.lastName}`,
                    initials: `${(user.firstname || user.firstName || '').charAt(0)}${(user.lastname || user.lastName || '').charAt(0)}`,
                    rank: index + 1,
                    points: (user.knightPoints || 0).toLocaleString(),
                    winRate,
                    bets: stats.total,
                    medal: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'none'
                };
            });

        return res.status(200).json(leaderboard);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        const { page } = req.query;     // PAGINATION

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                message: "Search query is required",
                success: false,
            })
        }

        if (!page || typeof page !== 'string') {
            return res.status(400).json({
                message: "Missing page number",
                success: false,
            })
        }

        const skip = (parseInt(page) - 1) * 5;      // PAGINATION
        
        const searchTerms = query.split(' ').filter(term => term.length > 0);   // Break the search query into terms if there's a spacebar

        // Search the database through each term
        const filter = {
            $or: searchTerms.flatMap(term => [
                { firstname: { $regex: term, $options: 'i'} },
                { lastname: { $regex: term, $options: 'i'} },
                { username: { $regex: term, $options: 'i'} },
                { major: { $regex: term, $options: 'i'} },
            ]),
        };


        const total = await UserModel.countDocuments(filter);

        // Limit searches by 5 results per page
        const users = await UserModel.find(filter)
                    .select('firstname lastname username major').limit(5).skip(skip);     // Don't return password, ucfID, pointBalance or authentication fields and apply pagination

        return res.status(200).json({
            page,
            total,
            totalPages: Math.ceil(total / 5),
            results: users
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    try {

        const { id } = req.params;  

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.user.id !== id) {
            return res.status(403).json({ message: "Can only delete own account" });
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await deleteUserById(id);

        return res.json({
            message: "User deleted!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.user.id !== id) {
            return res.status(403).json({ message: "Can only update own account" });
        }

        const updatedUser = await updateUserById(
            id,
            { $set: updates },
        ).select('-authentication.password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getRedemptions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        if (req.user.id !== id) return res.status(403).json({ message: 'Forbidden' });

        const user = await getUserById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const redemptions = ((user as any).redemptions ?? [])
            .sort((a: any, b: any) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());

        return res.status(200).json(redemptions);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const contactSupport = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { subject, message } = req.body;
        if (!subject?.trim() || !message?.trim()) {
            return res.status(400).json({ message: 'Subject and message are required.' });
        }
        if (subject.trim().length > 100) {
            return res.status(400).json({ message: 'Subject must be 100 characters or less.' });
        }
        if (message.trim().length > 2000) {
            return res.status(400).json({ message: 'Message must be 2000 characters or less.' });
        }

        const user = await getUserById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const fromName = `${user.firstname} ${user.lastname}`;
        await sendSupportEmail(fromName, user.email, subject.trim(), message.trim());

        return res.status(200).json({ message: 'Your message has been sent to support.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to send support email.' });
    }
};

export const earnPoints = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authenticated" });

        const { code } = req.body;
        if (!code || typeof code !== 'string' || !/^\d{16}$/.test(code)) {
            return res.status(400).json({ message: "Code must be exactly 16 digits" });
        }

        const updated = await updateUserById(req.user.id, {
            $inc: { knightPoints: 1000 },
            $push: { ticketRedemptions: { pointsAdded: 1000, redeemedAt: new Date() } },
        });

        if (!updated) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ message: "1000 KP added!", knightPoints: updated.knightPoints });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getTicketRedemptions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const id = req.params.id as string;
        const user = await getUserById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const history = ((user as any).ticketRedemptions ?? [])
            .slice()
            .sort((a: any, b: any) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
        return res.status(200).json(history);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}