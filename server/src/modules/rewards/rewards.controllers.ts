import { Response } from 'express';
import { AuthenticatedRequest } from '../../helpers/auth';
import { UserModel } from '../users/users.model';


// Fixed reward catalog (only 3 rewards as your project requires)
const rewards = [
    { id: "reward1", name: "Free Drink", cost: 100 },
    { id: "reward2", name: "Free Snack", cost: 250 },
    { id: "reward3", name: "UCF Merch Entry", cost: 500 },
];


export const redeemReward = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { rewardId } = req.body;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!rewardId) {
            return res.status(400).json({ message: "Reward ID is required" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.user.id !== id) {
            return res.status(403).json({
                message: "Can only redeem rewards for own account"
            });
        }

        const reward = rewards.find(r => r.id === rewardId);

        if (!reward) {
            return res.status(404).json({ message: "Reward not found" });
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.pointBalance < reward.cost) {
            return res.status(400).json({
                message: "Not enough points to redeem this reward"
            });
        }

        user.pointBalance -= reward.cost;
        await user.save();

        return res.status(200).json({
            message: "Reward redeemed successfully",
            reward: reward.name,
            cost: reward.cost,
            remainingPoints: user.pointBalance
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};