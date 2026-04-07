import { Router } from 'express';
import { login, logout, register } from '../controllers/authentication';
import { verifyEmail } from '../controllers/verify';

export default (router: Router) => {
    router.post('/users/auth/register', register);
    router.post('/users/auth/login', login);
    router.post('/users/auth/logout', logout);
    router.get('/users/auth/verify-email', verifyEmail);
};