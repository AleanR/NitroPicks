import { Router } from 'express';
import { getRewards, redeemReward } from './rewards.controllers';
import { isAuthenticated } from '../../middlewares';
import { earnPoints } from '../users/users.controllers';

export default (router: Router) => {
    router.get('/rewards', isAuthenticated, getRewards);
    router.post('/users/:id/redeem', isAuthenticated, redeemReward);
    router.post('/users/:id/earn-points', isAuthenticated, earnPoints);
};