import { Request, Response } from 'express';
import { BetModel, createBet, deleteBetById, getBetById } from '../db/bets';
import { AuthenticatedRequest } from '../helpers/auth';
import { getUserById, updatePointBalanceById, updateUserById } from '../db/users';
import { getGameById, updateGameBetsById, updateGameById } from '../db/games';

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

        // Bet type consistency (single: 1 bet, parlay: >1 bet)
        const betType = legs.length === 1 ? 'single' : 'parlay';

        // Retrieve user ID from token
        const id = req.user.id;

        // Find if stake is sufficient
        const updatedUser = await updatePointBalanceById(id, stake);
        if (!updatedUser) {
            return res.status(400).json({ message: "Insufficient points" });
        }

        // Ensure valid inputs for each leg
        for (const leg of legs) {
            if (!leg.gameId || !leg.team || !leg.odds) {
                return res.status(400).json({ message: "Invalid bet data" });
            }

            const team = leg.team === "home" ? "numBettorsHome" : "numBettorsAway";
            const teamBetPool = leg.team === "home" ? "totalBetAmountHome" : "totalBetAmountAway";

            const updatedGame = await updateGameBetsById(leg.gameId.toString(), team, teamBetPool, stake);
            if (!updatedGame) {
                return res.status(400).json({ message: "Invalid game (expired or betting window closed)" });
            }
        }        

        const totalOdds = legs.reduce((acc: number, leg: any) => acc * leg.odds, 1)
        const expectedPayout = stake * totalOdds;

        const bet = await createBet({
            userId: id,
            stake,
            betType,
            legs,
            totalOdds,
            expectedPayout,
        });


        return res.status(200).json({
            message: "Bet created successfully",
            bet
        })
        
    } catch (error) {
        console.log(error);
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