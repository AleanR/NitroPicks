import { Router } from 'express';
import {
    deleteUser,
    earnPoints,
    getAllUsers,
    getCurrentUser,
    getLeaderboard,
    getPublicUser,
    getRedemptions,
    searchUsers,
    updateUser,
} from './users.controllers';
import { isAuthenticated } from '../../middlewares';
import { forgotPass, resetPass } from './users.password';

export default (router: Router) => {
    router.get('/users/me', isAuthenticated, getCurrentUser);
    router.post('/users/earn-points', isAuthenticated, earnPoints);
    router.get('/users', isAuthenticated, getAllUsers);
    router.delete('/users/:id', isAuthenticated, deleteUser);
    router.patch('/users/:id', isAuthenticated, updateUser);
    router.post('/users/forgot-password', forgotPass);
    router.patch('/users/reset-password/:token', resetPass);
    router.get('/users/search', isAuthenticated, searchUsers);
    router.get('/users/leaderboard', getLeaderboard);                    // public: leaderboard visible without login
    router.get('/users/:id', getPublicUser);                             // public: user profile for leaderboard View Profile
    router.get('/users/:id/redemptions', isAuthenticated, getRedemptions);
}
