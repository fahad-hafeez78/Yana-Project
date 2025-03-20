import RefreshToken from "../models/RefreshToken.js";
import bcrypt from "bcrypt";
import Users from "../models/Users.js";
import Participants from "../models/Participants.js";
import { Forbidden, Invalid, NotFound } from "../utils/customErrors.js";
import * as rolesService from "../services/rolesService.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtAuth.js";


export const login = async (username, password) => {

    try {

        let user = await Users.findOne({ userName: { $regex: new RegExp(`^${username}$`, "i") } });

        if (!user) {
            throw NotFound('User name Not Found.');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw Invalid('Password is Incorrect');
        }
        if (user.Status === "Inactive") {
            throw Invalid('Inactive User');
        }

        let permissions = [];
        try {
            const role = await rolesService.getRoleByName(user.Role);
            if (role) {
                permissions = role.permissions || [];
            } else {
                throw Forbidden('Invalid Role');
            }
        } catch (error) {
            throw error;
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await RefreshToken.create({ refreshToken: refreshToken, userId: user._id });

        const { userName, OTP, createdAt, updatedAt, __v, ...safeUser } = user.toObject();
        safeUser.permissions = permissions;
        return { accessToken, refreshToken, user: safeUser };
    }
    catch (error) {
        throw error;
    }
};

export const loginParticipant = async (username, password) => {

    try {
        let user = await Participants.findOne({ Username: { $regex: new RegExp(`^${username}$`, "i") } });
        if (!user) {
            throw NotFound('User name Not Found.');
        }
        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            throw Invalid('Password is Incorrect');
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        await RefreshToken.create({ refreshToken: refreshToken, userId: user._id });
        const { Password, OTP, createdAt, updatedAt, __v, ...safeUser } = user.toObject();
        return { accessToken, refreshToken, user: safeUser };
    }
    catch (error) {
        throw error;
    }
};