import { Router } from 'express';
import authentication from '../modules/authentication/authentication.routers';
import users from '../modules/users/users.routers';
import games from '../modules/games/games.routers';
import rewards from '../modules/rewards/rewards.routers';
import bets from '../modules/bets/bets.routers';

const router = Router();

export default (): Router => {
    authentication(router);
    users(router);
    games(router);
    rewards(router);
    bets(router);
    
    return router;
}