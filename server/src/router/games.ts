import { Router } from 'express';
import { getAllGames, addGame, updateGame, cancelGame, searchGames } from '../controllers/games';
import { isAdmin, isAuthenticated } from '../middlewares';

export default (router: Router) => {
    router.get('/games/search', isAuthenticated, searchGames);          // search games by query - for users & admin
    router.get('/games', isAuthenticated, isAdmin, getAllGames);           // list all games - for admin
    router.post('/games', isAuthenticated, isAdmin, addGame);             // create a game - for admin
    router.patch('/games/:id', isAuthenticated, isAdmin, updateGame);     // update scores/status/odds - for admin
    router.delete('/games/:id', isAuthenticated, isAdmin, cancelGame);    // delete a game - for admin
};
