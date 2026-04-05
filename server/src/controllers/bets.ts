import { Request, Response } from 'express';
import { BetModel, createBet, deleteBetById, getBetById } from '../db/bets';
import { AuthenticatedRequest } from '../helpers/auth';
import { getUserById, updateUserById } from '../db/users';
import { getGameById, updateGameById } from '../db/games';

export const addBet = async (req: AuthenticatedRequest, res: Response) => {
    try {

        const { stake, betType, legs, totalOdds, expectedPayout } = req.body;

        if (!stake || !betType || totalOdds || !expectedPayout || !legs) {
            return res.status(400).json({ message: "Missing required field(s)" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Bets must be array & non-empty
        if (!Array.isArray(legs) || legs.length === 0) {
            return res.status(400).json({ message: "Bets must be non-empty array" });
        }

        // Bet type consistency (single: 1 bet; parlay: >1 bet)
        if ((betType === "single" && legs.length !== 1) || 
            (betType === "parlay" && legs.length < 2)) {
                return res.status(400).json({ message: "Invalid Bet Type" });
            }

        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

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

        await deleteBetById(betId);

        return res.status(200).json({
            message: "Bet removed successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}