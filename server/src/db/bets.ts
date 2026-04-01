import mongoose from "mongoose";

const BetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    team: { type: String, enum: ['A', 'B'], required: true },   // which team they bet on
    amount: { type: Number, required: true, min: 1 },           // points wagered
}, { timestamps: true });

export const BetModel = mongoose.model('Bet', BetSchema);

export const getBetsByGame = (gameId: string) => BetModel.find({ gameId });
export const getBetsByUser = (userId: string) => BetModel.find({ userId });
export const createBet = (values: Record<string, any>) => BetModel.create(values);
