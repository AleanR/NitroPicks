import { Router } from 'express';
import { getAllGames, getGame, addGame, updateGame, removeGame } from '../controllers/games';
import { isAuthenticated } from '../middlewares';

export default (router: Router) => {
    router.get('/games', isAuthenticated, getAllGames);           // list all games
    router.get('/games/:id', isAuthenticated, getGame);          // get one game by id
    router.post('/games', isAuthenticated, addGame);             // create a game
    router.patch('/games/:id', isAuthenticated, updateGame);     // update scores/status/odds
    router.delete('/games/:id', isAuthenticated, removeGame);    // delete a game
};
