import { Request } from 'express';

// Define class for user once logged in
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}