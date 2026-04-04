import { deleteUser, getAllUsers, getLeaderboard, searchUsers, updateUser, getCurrentUser, adminGetEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent, getEvents, earnPoints, redeemPerk } from '../controllers/users';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares';
import { forgotPass } from '../controllers/forget';
import { resetPass } from '../controllers/reset';

export default (router: Router) => {
    router.get('/auth/me', isAuthenticated, getCurrentUser);
    router.get('/leaderboard', getLeaderboard);
    router.get('/users', isAuthenticated, getAllUsers);
    router.delete('/users/:id', isAuthenticated, deleteUser);
    router.patch('/users/:id', isAuthenticated, updateUser);
    router.post('/forgot-password', isAuthenticated, forgotPass);
    router.patch('/reset-password/:token', isAuthenticated, resetPass);
    router.get('/users/search', searchUsers);

    // Admin-only event management routes
    router.get('/admin/events', isAuthenticated, adminGetEvents);
    router.post('/admin/events', isAuthenticated, adminCreateEvent);
    router.patch('/admin/events/:id', isAuthenticated, adminUpdateEvent);
    router.delete('/admin/events/:id', isAuthenticated, adminDeleteEvent);

    // Public events route
    router.get('/events', getEvents);

    // Earn points
    router.post('/earn-points', isAuthenticated, earnPoints);

    // Redeem perk
    router.post('/redeem-perk', isAuthenticated, redeemPerk);
}