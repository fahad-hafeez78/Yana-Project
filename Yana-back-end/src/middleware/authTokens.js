import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken } from '../utils/jwtAuth.js';

export const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const refreshHeader = req.headers['refresh-token'];

    const accessToken = authHeader && authHeader.split(' ')[1];
    const refreshToken = refreshHeader;

    if (!accessToken) {
        return res.status(401).json({ message: "Access token missing" });
    }

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token missing" });
    }

    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
        return res.status(500).json({ message: "Server configuration error" });
    }

    // Step 1: Verify the access token
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid or expired refresh token" });
                }

                const storedToken = await RefreshToken.findOne({ refreshToken });

                if (!storedToken?.refreshToken) {
                    return res.status(403).json({ message: "Refresh token not found" });
                }
                if (storedToken?.refreshToken!==refreshToken) {
                    return res.status(403).json({ message: "Invalid Refresh token" });
                }
                
                const newAccessToken = generateAccessToken({ userId: decoded.userId });

                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                req.user = { userId: decoded.userId };
                next();
            });
        } else {
            req.user = user;
            next();
        }
    });
};
