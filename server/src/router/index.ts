import { Router } from 'express';
import authentication from './authentication';
import users from './users';
import games from './games';
import bets from './bets';

const router = Router();

export default (): Router => {
    authentication(router);
    users(router);
    games(router);
    bets(router);
    return router;
}