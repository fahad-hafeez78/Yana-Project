import { Retrieved } from "../utils/customResponses.js";
import * as authService from "../services/authService.js";
import RefreshToken from "../models/RefreshToken.js";

export const loginController = async (req, res, next) => {
    try {

        const { username, password } = req.body;
        const { accessToken, refreshToken, user } = await authService.login(username, password);

        res.setHeader('Authorization', `Bearer ${accessToken}`);
        res.setHeader('refresh-token', refreshToken);

        res.status(200).send(Retrieved('User log in successfully', { user }));

    } catch (error) {
        next(error);
    }
};

export const logoutController = async (req, res, next) => {
    try {
        
        const refreshToken = req.headers['refresh-token'];
        await RefreshToken.findOneAndDelete({ refreshToken });
        res.status(200).send(Retrieved('User logged out successfully'));

    } catch (error) {
        next(error);
    }
};


// Participants Auth Controllers Methods
export const loginParticipantController = async (req, res, next) => {
    try {

        const { Username, Password } = req.body;
        const { accessToken, refreshToken, user } = await authService.loginParticipant(Username, Password);

        res.setHeader('Authorization', `Bearer ${accessToken}`);
        res.setHeader('refresh-token', refreshToken);

        res.status(200).send(Retrieved('Participant log in successfully', { user }));

    } catch (error) {
        next(error);
    }
};

export const logoutParticipantController = async (req, res, next) => {
    try {
        
        const refreshToken = req.headers['refresh-token'];
        await RefreshToken.findOneAndDelete({ refreshToken });
        res.status(200).send(Retrieved('User logged out successfully'));

    } catch (error) {
        next(error);
    }
};