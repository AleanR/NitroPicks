import { Router } from 'express';
import { login, logout, register, verifyEmail } from './authentication.controllers';

export default (router: Router) => {
    router.post('/users/auth/register', register);
    router.post('/users/auth/login', login);
    router.post('/users/auth/logout', logout);
    router.get('/users/auth/verify-email', verifyEmail);
};