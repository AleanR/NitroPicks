import { Router } from 'express';
import { addBet, getAllBets, getMyBets, getMyBetsList, getRecentWinners, getUserBetsList } from './bets.controllers';
import { isAdmin, isAuthenticated } from '../../middlewares';

export default (router: Router) => {
    router.get('/bets/recent-winners', getRecentWinners); // public: users who recently won bets
    router.get('/bets/my', isAuthenticated, getMyBets);     // Get user's bet stats (win, lost, refund, etc.)
    router.get('/bets/my/list', isAuthenticated, getMyBetsList);    // Get user's bet list
    router.get('/bets/user/:id/list', isAuthenticated, getUserBetsList);    // Get another user's bet list
    router.get('/bets', isAuthenticated, isAdmin, getAllBets);  // Get all bets
    router.post('/bets', isAuthenticated, addBet);  // Place bet
}