import { Router } from 'express';
import authentication from './authentication';
import users from './users';
import games from './games';
import rewards from './rewards';

const router = Router();

export default (): Router => {
    authentication(router);
    users(router);
    games(router);
    rewards(router);
    return router;
}