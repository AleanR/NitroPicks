import { AuthenticatedRequest } from '../helpers/auth';
import { deleteUserById, getUsers, updateUserById, UserModel } from '../db/users';
import { Request, Response } from 'express';



export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUsers();

        return res.status(200).json(users);
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