import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
    sport: { type: String, required: true },        
    homeTeam: { type: String, required: true },     
    awayTeam: { type: String, required: true },     

    // Bettor counts per side
    numBettorsHome: { type: Number, default: 0 },
    numBettorsAway: { type: Number, default: 0 },

    // Total KP wagered per side
    totalBetAmountHome: { type: Number, default: 0 },
    totalBetAmountAway: { type: Number, default: 0 },

    // Odds — three standard bet types matching the frontend MarketEvent shape
    spread: {
        label: { type: String, default: '' },       // e.g. "UCF -3.5"
        odds:  { type: String, default: '' },       // e.g. "-150"
    },
    moneyline: {
        label: { type: String, default: '' },       // e.g. "UCF Win"
        odds:  { type: String, default: '' },       // e.g. "-150"
    },
    total: {
        label: { type: String, default: '' },       // e.g. "O/U 48.5"
        odds:  { type: String, default: '' },       // e.g. "-110"
    },

    // Scores
    scoreHome: { type: Number, default: 0 },
    scoreAway: { type: Number, default: 0 },

    // Betting window timer
    bettingOpensAt:  { type: Date, required: true },
    bettingClosesAt: { type: Date, required: true },

    // Game lifecycle
    status: {
        type: String,
        enum: ['upcoming', 'open', 'closed', 'finished'],
        default: 'upcoming',
    },
}, { timestamps: true });

export const GameModel = mongoose.model('Game', GameSchema);

export const getGames = () => GameModel.find();
export const getGameById = (id: string) => GameModel.findById(id);
export const createGame = (values: Record<string, any>) => GameModel.create(values);
export const updateGameById = (id: string, values: Record<string, any>) => GameModel.findByIdAndUpdate(id, values, { new: true, runValidators: true });
export const deleteGameById = (id: string) => GameModel.deleteOne({ _id: id });
