import { Router } from 'express';
import {
    contactSupport,
    deleteUser,
    earnPoints,
    getAllUsers,
    getCurrentUser,
    getLeaderboard,
    getPublicUser,
    getRedemptions,
    getTicketRedemptions,
    searchUsers,
    updateUser,
} from './users.controllers';
import { isAuthenticated } from '../../middlewares';
import { forgotPass, resetPass } from './users.password';

export default (router: Router) => {
    router.get('/users/me', isAuthenticated, getCurrentUser);       // get user's info once logged in
    router.post('/users/earn-points', isAuthenticated, earnPoints); // validate user's code to earn points
    router.get('/users', isAuthenticated, getAllUsers);
    router.delete('/users/:id', isAuthenticated, deleteUser);
    router.patch('/users/:id', isAuthenticated, updateUser);
    router.post('/users/forgot-password', forgotPass);              // handle forgot password
    router.patch('/users/reset-password/:token', resetPass);        // reset password
    router.get('/users/search', isAuthenticated, searchUsers);
    router.get('/users/leaderboard', getLeaderboard);                    // public: leaderboard visible without login
    router.get('/users/:id/redemptions', isAuthenticated, getRedemptions);  // redeem rewards & vouchers
    router.get('/users/:id/ticket-redemptions', isAuthenticated, getTicketRedemptions); // get point tickets
    router.post('/users/support/contact', isAuthenticated, contactSupport);
    router.get('/users/:id', getPublicUser);                             // public: view profile from leaderboard
}
