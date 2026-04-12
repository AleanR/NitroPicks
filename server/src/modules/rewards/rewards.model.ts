import mongoose from 'mongoose';

const RewardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['food', 'merch', 'campus', 'athletics', 'digital', 'experience'], required: true },
    description: { type: String, required: true },
    pointsCost: { type: Number, required: true, min: 1 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    quantityRedeemed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    eligibility: { type: String, default: '' },
    redemptionInstructions: { type: String, default: '' },
}, { timestamps: true });

export const RewardModel = mongoose.model('Reward', RewardSchema);

export const getActiveRewards = () => RewardModel.find({ isActive: true }).sort({ pointsCost: 1 });
export const getRewardById = (id: string) => RewardModel.findById(id);