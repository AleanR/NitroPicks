import { Router } from 'express';
import { addBet } from '../controllers/bets';
import { isAuthenticated } from '../middlewares';



export default (router: Router) => {
    router.post('/bets', isAuthenticated, addBet);
}   