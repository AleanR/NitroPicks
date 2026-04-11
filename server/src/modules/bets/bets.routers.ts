import { Router } from 'express';
import { addBet, getAllBets, getMyBets, getMyBetsList } from './bets.controllers';
import { isAdmin, isAuthenticated } from '../../middlewares';

export default (router: Router) => {
    router.get('/bets/my', isAuthenticated, getMyBets);
    router.get('/bets/my/list', isAuthenticated, getMyBetsList);
    router.get('/bets', isAuthenticated, isAdmin, getAllBets);
    router.post('/bets', isAuthenticated, addBet);
}