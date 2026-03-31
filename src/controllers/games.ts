import { Request, Response } from 'express';
import { getGames, getGameById, createGame, updateGameById, deleteGameById } from '../db/games';

export const getAllGames = async (req: Request, res: Response) => {
    try {
        const games = await getGames();
        return res.status(200).json(games);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getGame = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const game = await getGameById(id);
        if (!game) return res.status(404).json({ message: "Game not found" });
        return res.status(200).json(game);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addGame = async (req: Request, res: Response) => {
    try {
        // TODO: validate request body
        const game = await createGame(req.body);
        return res.status(201).json(game);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateGame = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updated = await updateGameById(id, req.body);
        if (!updated) return res.status(404).json({ message: "Game not found" });
        return res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const removeGame = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteGameById(id);
        return res.status(200).json({ message: "Game deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
