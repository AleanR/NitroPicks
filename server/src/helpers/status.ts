import cron from 'node-cron';
import { GameModel } from '../modules/games/games.model';


export function getGameStatus (game: any, now = new Date()): 'upcoming' | 'live' | 'finished' | 'cancelled' {
    if (game.status === 'cancelled') return 'cancelled';
    // Bettable from creation until bettingClosesAt (game start).
    // 'upcoming' is no longer used — all non-finished games are 'live' (open for bets).
    if (now >= new Date(game.bettingClosesAt)) return 'finished';
    return 'live';
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