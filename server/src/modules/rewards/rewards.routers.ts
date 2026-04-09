import { Router } from 'express';
import { redeemReward } from './rewards.controllers';
import { isAuthenticated } from '../../middlewares';

export default (router: Router) => {
    router.post('/users/:id/redeem', isAuthenticated, redeemReward);
};