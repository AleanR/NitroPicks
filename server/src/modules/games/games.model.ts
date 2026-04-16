import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
    sport: { type: String, default: 'Basketball' },
    homeTeam: { type: String, required: true },     
    awayTeam: { type: String, required: true },     

    // Bettor counts per side
    numBettorsHome: { type: Number, default: 0 },
    numBettorsAway: { type: Number, default: 0 },

    // Total KP wagered per side
    totalBetAmountHome: { type: Number, default: 100 },
    totalBetAmountAway: { type: Number, default: 100 },

    // Total bet pool
    betPool: { type: Number, default: 200, required: true },

    // Moneyline - percentage odds for each team win
    homeWin: {
        type: {
            label: { type: String, default: '' },       // e.g. "UCF Win"
            odds:  { type: Number, default: 0, required: true },       // e.g. 50% per team
        },
        required: true,
    },
    awayWin: {
        type: {
            label: { type: String, default: '' },
            odds: { type: Number, default: 0, required: true },
        },
        required: true,
    },

    // Scores
    scoreHome: { type: Number, default: 0, required: true },
    scoreAway: { type: Number, default: 0, required: true },


    // Sport Emoji
    emoji: { type: String, default: '🏀'},

    // Betting window timer
    bettingOpensAt:  { type: Date, required: true },
    bettingClosesAt: { type: Date, required: true },

    // Winner
    winner: { type: String, default: "" },

    // Game lifecycle
    status: {
        type: String,
        enum: ['upcoming', 'live', 'finished', 'cancelled'],
        default: 'upcoming',
    },
}, { timestamps: true });

export const GameModel = mongoose.model('Game', GameSchema);

export const getGames = () => GameModel.find().sort({ bettingClosesAt: 1 });
export const getGameById = (id: string) => GameModel.findById(id);
export const createGame = (values: Record<string, any>) => GameModel.create(values);
export const updateGameById = (id: string, values: Record<string, any>) => GameModel.findByIdAndUpdate(id, values, { returnDocument: 'after', runValidators: true });
export const deleteGameById = (id: string) => GameModel.deleteOne({ _id: id });