import { Router } from 'express';
import { deleteUser, getAllUsers, searchUsers, updateUser } from './users.controllers';
import { isAuthenticated } from '../../middlewares';
import { forgotPass, resetPass } from './users.password';

export default (router: Router) => {
    router.get('/users', isAuthenticated, getAllUsers);
    router.delete('/users/:id', isAuthenticated, deleteUser);
    router.patch('/users/:id', isAuthenticated, updateUser);
    router.post('/users/forgot-password', isAuthenticated, forgotPass);
    router.patch('/users/reset-password/:token', isAuthenticated, resetPass);
    router.get('/users/search', isAuthenticated, searchUsers);
}