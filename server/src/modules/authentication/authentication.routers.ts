import { Router } from 'express';
import { login, logout, register, verifyEmail, resendVerification } from './authentication.controllers';
import { getCurrentUser } from '../users/users.controllers';
import { isAuthenticated } from '../../middlewares';

export default (router: Router) => {
    router.post('/users/auth/register', register);
    router.post('/users/auth/login', login);
    router.post('/users/auth/logout', logout);
    router.get('/users/auth/verify-email', verifyEmail);
    router.post('/users/auth/resend-verification', isAuthenticated, resendVerification);

    // Backward-compatible aliases for deployed/cached clients still using /api/auth/*
    router.post('/auth/register', register);
    router.post('/auth/login', login);
    router.post('/auth/logout', logout);
    router.get('/auth/verify-email', verifyEmail);
    router.get('/auth/me', isAuthenticated, getCurrentUser);
};
