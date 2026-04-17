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

        const maxStake = Math.floor(user.knightPoints * 0.3);
        if (stake > maxStake) throw new Error('Stake exceeds 30% of your balance');

        const betType = legs.length === 1 ? "single" : "parlay";
        
        let totalOdds = 1;
        
        for (const leg of legs) {
            if (!leg.gameId || !leg.team || !leg.odds) throw new Error('Invalid bet data');
            
            if (typeof leg.gameId !== 'string' || typeof leg.team !== 'string' || typeof leg.odds !== 'number') 
                throw new Error ('Invalid bet data');

            const game = await getGameById(leg.gameId.toString()).session(session);

            if (!game) throw new Error('Game not found');

            // Auto-repair games seeded without odds/pool data.
            // Phantom pool amounts (100/100/200) keep the parimutuel formula
            // from dividing by zero and produce the expected 1.80 starting odds.
            if (!game.totalBetAmountHome || game.totalBetAmountHome < 100) game.totalBetAmountHome = 100;
            if (!game.totalBetAmountAway || game.totalBetAmountAway < 100) game.totalBetAmountAway = 100;
            if (!game.betPool || game.betPool < 200) game.betPool = 200;
            if (!game.homeWin || game.homeWin.odds == null) {
                game.homeWin = { label: `${game.homeTeam} Win`, odds: 1.8 } as any;
            }
            if (!game.awayWin || game.awayWin.odds == null) {
                game.awayWin = { label: `${game.awayTeam} Win`, odds: 1.8 } as any;
            }

            // Check for game status by comparing betting window to real-time
            const status = getGameStatus(game);

            if (status === 'cancelled') throw new Error('Game is cancelled');
            if (status === 'finished') throw new Error('Betting window closed');
            
            if (leg.team === 'home') {
                game.numBettorsHome += 1;
                game.totalBetAmountHome += stake;
            }
            else {
                game.numBettorsAway += 1;
                game.totalBetAmountAway += stake;
            }

            game.betPool += stake;

            game.homeWin.odds = Number((game.betPool / game.totalBetAmountHome * 0.9).toFixed(2));
            game.awayWin.odds = Number((game.betPool / game.totalBetAmountAway * 0.9).toFixed(2));

            await game.save({ session });

            totalOdds *= leg.odds;
        }

        const expectedPayout = ((stake * totalOdds).toFixed(2));

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