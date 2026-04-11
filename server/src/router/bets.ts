import { Router } from 'express';
import { addBet, getMyBets } from '../modules/bets/bets.controllers';
import { isAuthenticated } from '../middlewares';

export default (router: Router) => {
    router.get('/bets/my', isAuthenticated, getMyBets);
    router.post('/bets', isAuthenticated, addBet);
}