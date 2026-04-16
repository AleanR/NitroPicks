import cron from 'node-cron';
import { GameModel } from '../modules/games/games.model';

// Compare game start date with real time & return status
export function getGameStatus (game: any, now = new Date(Date.now())): 'upcoming' | 'live' | 'finished' | 'cancelled' {
    if (game.status === 'cancelled') return 'cancelled';
    if (game.status === 'finished') return 'finished';
    if (now < game.bettingClosesAt) return 'upcoming';
    return 'live';
}

// Apply cron scheduler - monitor and update game status, based on real time, every min
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