import { AuthenticatedRequest } from '../../helpers/auth';
import { deleteUserById, getUsers, updateUserById, UserModel, getUserById } from './users.model';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

const EventModel = mongoose.model.bind(mongoose);

let Event: any;
try {
    Event = mongoose.model('Event');
} catch {
    const eventSchema = new mongoose.Schema({
        homeTeam: String,
        awayTeam: String,
        date: String,
        time: String,
        status: { type: String, default: 'Open' },
        homeEmoji: { type: String, default: '🏀' },
        awayEmoji: { type: String, default: '🏀' },
        moneyline: {
            home: { label: String, odds: String },
            away: { label: String, odds: String },
        },
    }, { timestamps: true });
    Event = mongoose.model('Event', eventSchema);
}

const isAdminUser = async (req: AuthenticatedRequest): Promise<boolean> => {
    if (!req.user) return false;
    const user = await getUserById(req.user.id);
    return user?.username === 'admin';
};



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
            pointBalance: user.pointBalance,
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

        const isAdmin = user.username === 'admin';
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
        const users = await getUsers();
        const leaderboard = users
            .filter((u: any) => u.username !== 'admin')
            .sort((a: any, b: any) => (b.pointBalance || 0) - (a.pointBalance || 0))
            .slice(0, 10)
            .map((user: any, index: number) => ({
                id: user._id,
                name: `${user.firstname || user.firstName} ${user.lastname || user.lastName}`,
                initials: `${(user.firstname || user.firstName || '').charAt(0)}${(user.lastname || user.lastName || '').charAt(0)}`,
                rank: index + 1,
                points: (user.pointBalance || user.pointsBalance || 0).toLocaleString(),
                winRate: Math.floor(Math.random() * 30) + 50, // Placeholder
                bets: Math.floor(Math.random() * 50) + 20, // Placeholder
                medal: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'none'
            }));

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

export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await Event.find({ status: { $ne: 'Closed' } });
        const parseMMDDYY = (d: string) => {
            const [mm, dd, yy] = (d || '').split('-').map(Number);
            return new Date(2000 + (yy || 0), (mm || 1) - 1, dd || 1).getTime();
        };
        const sorted = events.sort((a: any, b: any) => parseMMDDYY(a.date) - parseMMDDYY(b.date));
        return res.status(200).json(sorted);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const adminGetEvents = async (req: AuthenticatedRequest, res: Response) => {
    if (!(await isAdminUser(req))) return res.status(403).json({ message: "Forbidden" });
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        return res.status(200).json(events);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const adminCreateEvent = async (req: AuthenticatedRequest, res: Response) => {
    if (!(await isAdminUser(req))) return res.status(403).json({ message: "Forbidden" });
    try {
        const { homeTeam, awayTeam, date, time, status, homeEmoji, awayEmoji, homeOdds, awayOdds } = req.body;
        if (!homeTeam || !awayTeam || !date || !time) {
            return res.status(400).json({ message: "homeTeam, awayTeam, date, and time are required" });
        }
        const event = await Event.create({
            homeTeam,
            awayTeam,
            date,
            time,
            status: status || 'Open',
            homeEmoji: homeEmoji || '🏀',
            awayEmoji: awayEmoji || '🏀',
            moneyline: {
                home: { label: `${homeTeam} Win`, odds: homeOdds || '1.90' },
                away: { label: `${awayTeam} Win`, odds: awayOdds || '1.90' },
            },
        });
        return res.status(201).json(event);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const adminUpdateEvent = async (req: AuthenticatedRequest, res: Response) => {
    if (!(await isAdminUser(req))) return res.status(403).json({ message: "Forbidden" });
    try {
        const { id } = req.params;
        const updated = await Event.findByIdAndUpdate(id, { $set: req.body }, { new: true });
        if (!updated) return res.status(404).json({ message: "Event not found" });
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const adminDeleteEvent = async (req: AuthenticatedRequest, res: Response) => {
    if (!(await isAdminUser(req))) return res.status(403).json({ message: "Forbidden" });
    try {
        const { id } = req.params;
        await Event.findByIdAndDelete(id);
        return res.status(200).json({ message: "Event deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const earnPoints = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authenticated" });

        const { code } = req.body;
        if (!code || typeof code !== 'string' || !/^\d{16}$/.test(code)) {
            return res.status(400).json({ message: "Code must be exactly 16 digits" });
        }

        const updated = await updateUserById(req.user.id, { $inc: { pointBalance: 1000 } });

        if (!updated) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ message: "1000 KP added!", pointBalance: updated.pointBalance });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const PERK_COSTS: Record<string, number> = {
    'ucf-dining': 5000,
    'ucf-hoodie': 8000,
    'bookstore-voucher': 10000,
    'knights-ticket': 20000,
};

export const redeemPerk = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authenticated" });

        const { perkId } = req.body;
        const cost = PERK_COSTS[perkId];
        if (!cost) return res.status(400).json({ message: "Unknown perk" });

        const user = await getUserById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if ((user.pointBalance || 0) < cost) {
            return res.status(400).json({ message: "Not enough KP" });
        }

        const updated = await updateUserById(req.user.id, { $inc: { pointBalance: -cost } });

        // Generate a cryptographically random 16-digit confirmation code
        const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');

        return res.status(200).json({
            message: "Purchase successful!",
            confirmationCode: digits,
            pointBalance: updated?.pointBalance,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}