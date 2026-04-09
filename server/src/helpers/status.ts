import cron from 'node-cron';
import { GameModel } from '../modules/games/games.model';


export function getGameStatus (game: any, now = new Date()): 'upcoming' | 'live' | 'finished' | 'cancelled' {
    if (game.status === 'cancelled') return 'cancelled';
    if (now < game.bettingOpensAt) return 'upcoming';
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