import { Request, Response } from 'express';
import { getGames, getGameById, createGame, updateGameById, deleteGameById, GameModel } from './games.model';
import { AuthenticatedRequest } from '../../helpers/auth';
import { refundPlayersByBets } from '../bets/bets.model';
import { refund } from '../services/cancel.service';
import { gameOver } from '../services/results.service';


// GET ALL GAMES
export const getAllGames = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const games = await getGames();
        return res.status(200).json(games);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// SEARCH GAMES
export const searchGames = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        const { page } = req.query; // PAGINATION


        // Validate all queries
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                message: "Search query is required",
                success: false
            })
        }

        if (!page || typeof page !== 'string') {
            return res.status(400).json({
                message: "Missing page number",
                success: false
            })
        }

        const skip = (parseInt(page) - 1) * 7;
        
        const searchTerms = query.split(' ').filter(term => term.length > 0);

        // Apply search filter (can only search home & away teams & certain game status)
        const filter = {
            $or: searchTerms.flatMap(term => [
                { homeTeam: { $regex: term, $options: 'i' } },
                { awayTeam: { $regex: term, $options: 'i' } },
                { status: { $regex: term, $options: 'i' } },
            ])
        }

        const total = await GameModel.countDocuments(filter);

        // Limit searches by 7 results per page
        const games = await GameModel.find(filter)
                .select('sport homeTeam awayTeam status homeWin awayWin betPool numBettorsHome numBettorsAway totalBetAmountHome totalBetAmountAway bettingOpensAt bettingClosesAt')
                .limit(7).skip(skip);

        return res.status(200).json({
            page,
            total,
            totalPages: Math.ceil(total / 7),
            results: games
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ADD GAMES
export const addGame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { homeTeam, awayTeam, bettingOpensAt, bettingClosesAt } = req.body;

        if (!homeTeam || !awayTeam || !bettingOpensAt || !bettingClosesAt) {
            return res.status(400).json({ message: "Missing required field(s)" });
        }

        if (typeof homeTeam !== 'string' || typeof awayTeam !== 'string') {
            return res.status(400).json({ message: "Team names must be string"});
        }

        // Validate Date instances for betting window
        const betStart = new Date(bettingOpensAt);
        const betClose = new Date(bettingClosesAt);

        if (!(betStart instanceof Date && !isNaN(betStart.getTime()))
            || !(betClose instanceof Date && !isNaN(betClose.getTime()))) {
                return res.status(400).json({ message: "Invalid dates" });
        }

        // Validate betting window
        if (betClose <= betStart) {
            return res.status(400).json({ message: "Invalid betting window" });
        }

        // Initialize odds: 50/50 with 10% house margin → 1/(0.5)*(1-0.1) = 1.80
        const initOdds = 1.8;
        const homeWin = { "label": `${homeTeam.split(' ')[1]} Win`, "odds": initOdds };
        const awayWin = { "label": `${awayTeam.split(' ')[1]} Win`, "odds": initOdds };


        // creating Game
        await createGame({
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            homeWin: homeWin,
            awayWin: awayWin,
            bettingOpensAt: betStart,
            bettingClosesAt: betClose,
        });

        return res.status(201).json({
            message: "Game created successfully",
            // game
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// UPDATE GAMES
export const updateGame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(400).json({ message: "Unauthorized" });
        }
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }

        const updated = await updateGameById(id, req.body);
        
        if (!updated) 
            return res.status(404).json({ message: "Game not found" });

        return res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const endGame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(400).json({ message: "Unauthorized" });
        }

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }

        await gameOver(id);

        return res.status(200).json({ message: "Game ended successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// CANCEL GAME — refund all bettors and mark as cancelled (does not delete)
export const cancelGame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(400).json({ message: "Unauthorized" });
        }

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }

        await refund(id);

        return res.status(200).json({ message: "Game cancelled and all bets refunded" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// DELETE GAME — hard delete, admin only, use only when game was created by mistake
export const deleteGame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(400).json({ message: "Unauthorized" });
        }

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }

        const game = await getGameById(id);
        if (!game) return res.status(404).json({ message: "Game not found" });

        await deleteGameById(id);
        return res.status(200).json({ message: "Game deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// PUBLIC — list upcoming/live games for frontend markets page
export const getPublicGames = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        // Include all open games plus games closed within the last 24 h (so the Closed tab has data)
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const games = await GameModel.find({
            status: { $ne: 'cancelled' },
            bettingClosesAt: { $gt: oneDayAgo },
        })
            .select('sport homeTeam awayTeam homeWin awayWin betPool numBettorsHome numBettorsAway totalBetAmountHome totalBetAmountAway bettingOpensAt bettingClosesAt status')
            .sort({ bettingOpensAt: 1 });
        return res.status(200).json(games);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
