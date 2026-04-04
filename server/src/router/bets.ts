import { Router } from 'express';
import { addBet } from '../controllers/bets';



export default (router: Router) => {
    router.post('/bets', addBet);
}   