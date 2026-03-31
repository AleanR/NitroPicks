import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
    game: { type: String, required: true },           // e.g. "Basketball", "Football"
    teamA: { type: String, required: true },
    teamB: { type: String, required: true },

    // Bettor counts per team
    numBettorsA: { type: Number, default: 0 },
    numBettorsB: { type: Number, default: 0 },

    // Total points wagered per team
    totalBetAmountA: { type: Number, default: 0 },
    totalBetAmountB: { type: Number, default: 0 },

    // Odds per team
    oddsA: { type: Number, default: 1.0 },
    oddsB: { type: Number, default: 1.0 },

    // Scores
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },

    // Betting window timer
    bettingOpensAt: { type: Date, required: true },
    bettingClosesAt: { type: Date, required: true },

    // Game lifecycle status
    status: {
        type: String,
        enum: ['upcoming', 'open', 'closed', 'finished'],
        default: 'upcoming'
    },
}, { timestamps: true });

export const GameModel = mongoose.model('Game', GameSchema);

export const getGames = () => GameModel.find();
export const getGameById = (id: string) => GameModel.findById(id);
export const createGame = (values: Record<string, any>) => GameModel.create(values);
export const updateGameById = (id: string, values: Record<string, any>) => GameModel.findByIdAndUpdate(id, values, { new: true, runValidators: true });
export const deleteGameById = (id: string) => GameModel.deleteOne({ _id: id });
