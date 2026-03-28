import { AuthenticatedRequest } from '../helpers/auth';
import { deleteUserById, getUsers, updateUserById, UserModel } from '../db/users';
import { Request, Response } from 'express';



export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUsers();

        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error"});
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

        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-authentication.password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        updatedUser.updatedAt = new Date(Date.now());
        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}