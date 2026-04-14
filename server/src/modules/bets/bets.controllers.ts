import { Response } from 'express';
import { createBet, deleteBetById, getBetById, getBets, getBetsByUser, getBetsByUserWithGames } from '../bets/bets.model';
import { AuthenticatedRequest } from '../../helpers/auth';
import { deductKnightPoints } from '../users/users.model';
import { placeBet } from '../services/bet.service';


export const getMyBets = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const bets = await getBetsByUser(req.user.id);
        const total = bets.length;
        const won   = bets.filter(b => b.status === 'win').length;
        const lost  = bets.filter(b => b.status === 'lose').length;
        return res.status(200).json({ total, won, lost });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyBetsList = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const bets = await getBetsByUserWithGames(req.user.id);
        return res.status(200).json(bets);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserBetsList = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const bets = await getBetsByUserWithGames(id);
        return res.status(200).json(bets);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllBets = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const bets = await getBets();
        return res.status(200).json(bets);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const addBet = async (req: AuthenticatedRequest, res: Response) => {
    try {

        const { stake, legs } = req.body;

        if (!stake || !legs) {
            return res.status(400).json({ message: "Missing required field(s)" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Bets must be array & non-empty
        if (!Array.isArray(legs) || legs.length === 0) {
            return res.status(400).json({ message: "Bets must be non-empty array" });
        }

        const bet = await placeBet(req.user.id, stake, legs);


        return res.status(201).json({
            message: "Bet created successfully",
            bet
        })

    } catch (error: any) {
        console.log(error);
        // Surface business-logic errors as 400 so the client sees the real message
        const businessErrors = [
            'User not found',
            'Insufficient funds',
            'Stake exceeds 30%',
            'Invalid bet data',
            'Game not found',
            'Game is cancelled',
            'Betting window closed',
            'Betting not yet open',
            'Game odds data is missing',
        ];
        const msg: string = error?.message ?? '';
        if (businessErrors.some((e) => msg.includes(e))) {
            return res.status(400).json({ message: msg });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}





///////////////// DON'T WORRY ABOUT THIS ///////////////////////////

export const removeBet = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { betId } = req.params;

        if (!betId || Array.isArray(betId)) {
            return res.status(400).json({ message: "Bet ID is required" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const bet = await getBetById(betId);

        if (!bet) {
            return res.status(400).json({ message: "Bet not found" });
        }

        // Expired bet
        if(bet.status === "win" || bet.status === "lose") {
            return res.status(400).json({ message: "Bet is already expired" });
        }
        
        await deleteBetById(betId);

        return res.status(200).json({
            message: "Bet removed successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}