import mongoose from 'mongoose';
import { getUserById } from '../users/users.model';
import { getGameById } from '../games/games.model';
import { createBet } from '../bets/bets.model';
import { getGameStatus } from '../../helpers/status';

export async function placeBet (userId: string, stake: number, legs: any) {

    const session = await mongoose.startSession();
    try {

        session.startTransaction();

        const user = await getUserById(userId).session(session);
        if (!user) throw new Error('User not found');
        if (user.knightPoints < stake) throw new Error('Insufficient funds');

        const betType = legs.length === 1 ? "single" : "parlay";
        
        let totalOdds = 1;
        
        for (const leg of legs) {
            if (!leg.gameId || !leg.team || !leg.odds) throw new Error('Invalid bet data');
            
            if (typeof leg.gameId !== 'string' || typeof leg.team !== 'string' || typeof leg.odds !== 'number') 
                throw new Error ('Invalid bet data');

            const game = await getGameById(leg.gameId.toString()).session(session);

            if (!game) throw new Error('Game not found');

            // Check for game status by comparing betting window to real-time
            const status = getGameStatus(game);
            if (status === 'cancelled') throw new Error('Game is cancelled');
            if (status !== 'upcoming') throw new Error('Betting window closed');

            if (leg.team === 'home') {
                game.numBettorsHome += 1;
                game.totalBetAmountHome += stake;
                
                // Odds tolerance window
                if (Math.abs(leg.odds - game.homeWin.odds) > 0.1)
                    throw new Error('Odds changed too much, please confirm new odds');
            }
            else {
                game.numBettorsAway += 1;
                game.totalBetAmountAway += stake;

                // Odds tolerance window
                if (Math.abs(leg.odds - game.awayWin.odds) > 0.1) 
                    throw new Error('Odds changed too much, please confirm new odds');
            }

            game.betPool += stake;

            game.homeWin.odds = game.betPool / game.totalBetAmountHome * 0.9;
            game.awayWin.odds = game.betPool / game.totalBetAmountAway * 0.9;

            await game.save({ session });

            totalOdds *= leg.odds;
        }

        const expectedPayout = stake * totalOdds;

        const bet = await createBet({
            userId: userId,
            stake: stake,
            betType: betType,
            legs: legs,
            totalOdds: totalOdds,
            expectedPayout: expectedPayout,
        })

        user.knightPoints -= stake;
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();


        return bet;


    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}