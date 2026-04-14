import { Router } from 'express';
import { getAllGames, addGame, updateGame, cancelGame, deleteGame, searchGames, getPublicGames, endGame, updateScore } from './games.controllers';
import { isAdmin, isAuthenticated } from '../../middlewares';

export default (router: Router) => {
    router.get('/games', getPublicGames);                                        // public: upcoming/live games for markets page
    router.get('/games/search', isAuthenticated, searchGames);                  // search games - users & admin
    router.get('/games/all', isAuthenticated, isAdmin, getAllGames);             // all games - admin only
    router.post('/games', isAuthenticated, isAdmin, addGame);                   // create game - admin only
    router.patch('/games/:id', isAuthenticated, isAdmin, updateGame);           // update scores/odds - admin only
    router.patch('/games/:id/score', isAuthenticated, isAdmin, updateScore);           // update scores/odds - admin only
    router.delete('/games/:id/cancel', isAuthenticated, isAdmin, cancelGame);   // cancel + refund - admin only
    router.delete('/games/:id', isAuthenticated, isAdmin, deleteGame);          // hard delete - admin only
    router.put('/games/:id/end', isAuthenticated, isAdmin, endGame);            // resolve payouts - admin only
};
