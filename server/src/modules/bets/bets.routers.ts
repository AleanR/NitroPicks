import { Router } from 'express';
import { addBet, getAllBets } from './bets.controllers';
import { isAdmin, isAuthenticated } from '../../middlewares';




export default (router: Router) => {
    router.get('/bets', isAuthenticated, isAdmin, getAllBets);
    router.post('/bets', isAuthenticated, addBet);
}   