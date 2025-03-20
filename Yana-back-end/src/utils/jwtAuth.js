import jwt from "jsonwebtoken"
import { BadRequest } from "./customErrors.js";

export const generateAccessToken = (user) => {

    if (!user.Role) {
        user.Role = "Participant";
    }

    return jwt.sign(
        { _id: user._id, role: user.Role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_LIFETIME || '1h' }
    );

};


export const generateRefreshToken = (user) => {

    if (!user._id) {
        throw BadRequest("User ID is required to generate refresh token.");
    }
    
    return jwt.sign(
        { id: user._id, role: user.Role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_LIFETIME || '90d' }
    );
    
};
