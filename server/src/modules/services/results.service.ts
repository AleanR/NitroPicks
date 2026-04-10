import mongoose from 'mongoose';
import { getBetsByGame } from '../bets/bets.model';
import { getUserById } from '../users/users.model';
import { getGameById } from '../games/games.model';


export async function gameOver(gameId: string) {

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const game = await getGameById(gameId).session(session);
        if (!game || game.status !== 'live') throw new Error('Game not found');

        const isTie = game.scoreHome === game.scoreAway;
        const team = isTie ? 'tie' : (game.scoreHome > game.scoreAway ? 'home' : 'away');

        game.winner = team;
        game.status = 'finished';


        await game.save({ session });
        
        const bets = await getBetsByGame(gameId).session(session);
        if (!bets) throw new Error("No bets found");

        for (const bet of bets) {
            if (bet.status === 'active') {

                // TIE — refund stake to all bettors
                if (isTie) {
                    bet.status = 'refunded';
                    for (const leg of bet.legs) leg.result = 'cancelled';
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
    
                        user.knightPoints += bet.expectedPayout;
                        await user.save({ session });
                    }
                    else {
                        bet.legs[0].result = 'lose';
                        bet.status = 'lose';
                    }
                }

                // PARLAY BETS
                if (bet.betType === 'parlay') {
                    let gamesWon = 0;   // Count all the games won

                    for (const leg of bet.legs) {
                        if (leg.team === team && leg.result === 'pending') {
                            leg.result = 'win';
                            gamesWon += 1;
                        }
                        else {
                            leg.result = 'lose';
                            bet.status = 'lose';
                            break;
                        }
                    }

                    if (gamesWon === bet.legs.length) {
                        bet.status = 'win';

                        const user = await getUserById(bet.userId.toString()).session(session);
                        if (!user) throw new Error('User not found');

                        user.knightPoints += bet.expectedPayout;
                        await user.save({ session });
                    }
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