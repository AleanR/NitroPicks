import mongoose from "mongoose";
import { refund } from "../users/users.model";

////// Single ///////////
const BetLegSchema = new mongoose.Schema({
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    team: { type: String, enum: ["home", "away"], required: true },
    odds: { type: Number, required: true },
    result: { type: String, enum: ["pending", "win", "lose", "cancelled"], default: 'pending' }
})

/////// Parlay ////////////
const BetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stake: { type: Number, required: true, min: 1 },           // points wagered
    betType: { type: String, enum: ['single', 'parlay'], default: 'single', required: true },
    status: { type: String, enum: ['active', 'win', 'lose', 'refunded'], required: true, default: 'active' },
    ///////////
    legs: { type: [BetLegSchema] },
    ////////////
    totalOdds: { type: Number, required: true, default: 0 },
    expectedPayout: { type: Number, required: true, default: 0 },
    
}, { timestamps: true });


export const BetModel = mongoose.model('Bet', BetSchema);


export const getBets = async () => BetModel.find();
export const getBetsByGame = (gameId: string) => BetModel.find({ 'legs.gameId': gameId });
export const getBetsByUser = (userId: string) => BetModel.find({ userId });
export const getBetById = (id: string) => BetModel.findById(id);
export const createBet = (values: Record<string, any>) => BetModel.create(values);


export const deleteBetById = (id: string) => BetModel.deleteOne({ _id: id });


export const refundPlayersByBets = async (gameId: string) => {
    const bets = await getBetsByGame(gameId);

    if (!bets) {
        return null;
    }

    for (const bet of bets) {
        await refund(bet.userId.toString(), bet.stake);
        await BetModel.findByIdAndUpdate(
            bet._id.toString(),
            {
                $set: {
                    status: "refunded"
                }
            }
        )
    }

    return bets;
}




