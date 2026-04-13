import mongoose from 'mongoose';
import { getBetsByGame } from '../bets/bets.model';
import { getUserById } from '../users/users.model';
import { getGameById } from '../games/games.model';


export async function gameOver(gameId: string, winner?: 'home' | 'away' | 'tie') {

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const game = await getGameById(gameId).session(session);
        if (!game) throw new Error('Game not found');
        if (game.status === 'cancelled') throw new Error('Game is cancelled');
        if (game.winner && game.winner !== '') throw new Error('Game has already been resolved');

        // Use the explicitly provided winner, otherwise derive from scores
        const team = winner ?? (game.scoreHome === game.scoreAway
            ? 'tie'
            : game.scoreHome > game.scoreAway ? 'home' : 'away');
        const isTie = team === 'tie';

        game.winner = team;
        game.status = 'finished';


        await game.save({ session });
        
        const bets = await getBetsByGame(gameId).session(session);

        for (const bet of bets) {
            if (bet.status !== 'active') continue;

            // TIE — refund stake to all bettors
            if (isTie) {
                bet.status = 'refunded';
                for (const leg of bet.legs) {
                    if (leg.gameId.toString() === gameId) leg.result = 'cancelled';
                }
                const user = await getUserById(bet.userId.toString()).session(session);
                if (!user) throw new Error('User not found');
                user.knightPoints += bet.stake;
                await user.save({ session });
                await bet.save({ session });
                continue;
            }

            // SINGLE BET
            if (bet.betType === 'single') {
                if (bet.legs[0].team === team) {
                    bet.legs[0].result = 'win';
                    bet.status = 'win';
                    const user = await getUserById(bet.userId.toString()).session(session);
                    if (!user) throw new Error('User not found');
                    user.knightPoints += Math.round(bet.expectedPayout);
                    await user.save({ session });
                } else {
                    bet.legs[0].result = 'lose';
                    bet.status = 'lose';
                }
            }

            // PARLAY BETS — only update the leg for this specific game
            if (bet.betType === 'parlay') {
                for (const leg of bet.legs) {
                    if (leg.gameId.toString() === gameId && leg.result === 'pending') {
                        leg.result = leg.team === team ? 'win' : 'lose';
                    }
                }

                const hasLoss = bet.legs.some(l => l.result === 'lose');
                if (hasLoss) {
                    // Any leg losing kills the whole parlay
                    bet.status = 'lose';
                } else {
                    const allResolved = bet.legs.every(l => l.result !== 'pending');
                    if (allResolved) {
                        // All legs won — pay out
                        bet.status = 'win';
                        const user = await getUserById(bet.userId.toString()).session(session);
                        if (!user) throw new Error('User not found');
                        user.knightPoints += Math.round(bet.expectedPayout);
                        await user.save({ session });
                    }
                    // else: still waiting on other games in this parlay — leave as active
                }
            }

            await bet.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

    } catch (error) {
        session.abortTransaction();
        session.endSession();
        throw error;
    }
}