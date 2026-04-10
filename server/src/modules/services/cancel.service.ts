import mongoose from 'mongoose';
import { getBetsByGame } from '../bets/bets.model';
import { getUserById } from '../users/users.model';
import { getGameById } from '../games/games.model';


export async function refund (gameId: string) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const bets = await getBetsByGame(gameId).session(session);
        if (!bets) throw new Error('Bets not found');

        for (const bet of bets) {
            if (bet.status === 'active') {
                if (bet.betType === 'single' && bet.legs[0].result === 'pending') {
                    bet.legs[0].result = 'cancelled';
                    bet.status = 'refunded';

                    const user = await getUserById(bet.userId.toString()).session(session);
                    if (!user) throw new Error("User not found");

                    user.knightPoints += bet.stake;
                    await user.save({ session });
                }

                if (bet.betType === 'parlay') {
                    for (const leg of bet.legs) {
                        if (leg.gameId.toString() === gameId) {
                            leg.result = 'cancelled';
                            break;
                        }
                    }
                    bet.status = 'refunded';

                    const user = await getUserById(bet.userId.toString()).session(session);
                    if (!user) throw new Error("User not found");

                    user.knightPoints += bet.stake;
                    await user.save({ session });
                }
            }
            await bet.save({ session });
        }
        
        const game = await getGameById(gameId);
        if (!game) throw new Error('Game not found');
        game.status = "cancelled";

        await game.save();
        
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        session.abortTransaction();
        session.endSession();
        throw error;
    }
}