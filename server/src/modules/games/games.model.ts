import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
    // sport: { type: String, required: true },        
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


/////////// FOR FRONTEND - Check game status - /////////////////////////
GameSchema.virtual('computedStatus').get(function() {
    const now = new Date();
    if (this.status === 'cancelled') return 'cancelled';
    if (now < this.bettingOpensAt) return 'upcoming';
    if (now >= this.bettingOpensAt && now <= this.bettingClosesAt) return 'live';
    return 'finished';
})

export const GameModel = mongoose.model('Game', GameSchema);

export const getGames = () => GameModel.find();
export const getGameById = (id: string) => GameModel.findById(id);
export const createGame = (values: Record<string, any>) => GameModel.create(values);
export const updateGameById = (id: string, values: Record<string, any>) => GameModel.findByIdAndUpdate(id, values, { returnDocument: 'after', runValidators: true });
export const deleteGameById = (id: string) => GameModel.deleteOne({ _id: id });

export const updateGameBetsById = async (id: string, team: string, teamBetPool: string, amount: number) => {

    const game = await getGameById(id);
    if (!game) {
        return null;
    }

    const margin = 0.9;

    const updatedGame = await updateGameById(
        game._id.toString(),
        [
            { 
                $set: {
                    [team]: { 
                        $add: [`$${team}`, 1] 
                    },
                    [teamBetPool]: { 
                        $add: [`$${teamBetPool}`, amount] 
                    },
                    betPool: {
                         $add: ["$betPool", amount] 
                    }
                }
            },
            {
                $set: {

                    // Calculating odds for each team after placing bet
                    // newOdd = ( updatedBetPool / updatedPoolForTeamA ) * 0.9 -> Fixed 10% house margin
                    "homeWin.odds": { 
                        $multiply: [
                            { $divide: ["$betPool", "$totalBetAmountHome"] },
                            0.9 
                        ]
                    },
                    "awayWin.odds": { 
                        $multiply: [
                             { $divide: ["$betPool", "$totalBetAmountAway"] },
                            0.9 
                        ]
                    }
                }
            }
        ]
    )

    return updatedGame;
}