import { Request, Response } from 'express';
import { getGames, getGameById, createGame, updateGameById, deleteGameById, GameModel } from '../db/games';
import { AuthenticatedRequest } from '../helpers/auth';
import { refundPlayersByBets } from '../db/bets';


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
                .select('homeTeam awayTeam status homeWin awayWin betPool bettingOpensAt bettingClosesAt')
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
        // TODO: validate request body
        const { homeTeam, awayTeam, bettingOpensAt, bettingClosesAt } = req.body;

        if (!homeTeam || !awayTeam || !bettingOpensAt || !bettingClosesAt) {
            return res.status(400).json({ message: "Missing required field(s)" });
        }

        if (Array.isArray(homeTeam) || Array.isArray(awayTeam)) {
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

        // Calculating initial odds
        const margin = 0.1; // fixed 10% house margin
        const initialProb = 0.5;    // Each game has 50% probability

        const initOdds = 1 / initialProb * (1 - margin);
        

        // Initialize odds for home & away teams
        const homeWin = { "label": "", "odds": initOdds };
        const awayWin = { "label": "", "odds": initOdds };


        // creating Game
        const game = await createGame({
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

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }

        const updated = await updateGameById(id, req.body);
        if (!updated) return res.status(404).json({ message: "Game not found" });
        return res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// CANCEL GAMES
export const cancelGame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(400).json({ message: "Unauthorized" });
        }

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }
        
        const game = await getGameById(id);

        if (!game) {
            return res.status(400).json({ message: "Game not found" });
        }
        const bets = await refundPlayersByBets(id);
        
        await deleteGameById(id);
        return res.status(200).json({ message: "Game deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
