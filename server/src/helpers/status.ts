import cron from 'node-cron';
import { GameModel } from '../modules/games/games.model';


// Maximum time a game can be "live" after bettingOpensAt.
// Guards against games where bettingClosesAt was set far in the future by mistake.
const MAX_GAME_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

export function getGameStatus (game: any, now = new Date()): 'upcoming' | 'live' | 'finished' | 'cancelled' {
    if (game.status === 'cancelled') return 'cancelled';
    if (now < game.bettingOpensAt) return 'upcoming';

    // If bettingOpensAt was more than 6 hours ago, the game is definitely over
    const opensAt = new Date(game.bettingOpensAt);
    if (now.getTime() - opensAt.getTime() > MAX_GAME_DURATION_MS) return 'finished';

    if (now >= game.bettingOpensAt && now <= game.bettingClosesAt) return 'live';
    return 'finished';
}

cron.schedule('* * * * *', async () => {
    const now = new Date();

    const games = await GameModel.find({ status: { $in: ['upcoming', 'live'] } });
    const bulk = games.map(game => ({
        updateOne: {
            filter: { _id: game._id },
            update: { $set: { status: getGameStatus(game, now) } }
        }
    }));

    if (bulk.length) await GameModel.bulkWrite(bulk);
})