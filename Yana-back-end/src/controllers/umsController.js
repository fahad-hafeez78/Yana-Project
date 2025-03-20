import * as usersService from '../services/usersService.js';
import { uploadMiddleware } from '../services/s3BucketService.js';
import { Created, Deleted, Retrieved, Updated } from '../utils/customResponses.js';

export const createUser = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            
            if (err) return next({ status: 400, message: err.message });

            const data = await usersService.createUser(req);
            res.status(201).send(Created('User created successfully', data));

        } catch (error) {
            next(error);
        }
    });
};


export const getAllUsers = async (req, res, next) => {
    try {
        const data = await usersService.getAllUsers();
        res.status(200).send(Retrieved('Users retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};


export const updateUser = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const data = await usersService.updateUser(req);
            res.status(200).send(Updated('User updated successfully', data));

        } catch (error) {
            next(error);
        }
    });
};

export const updatePassword = async (req, res, next) => {
        try {
            const data = await usersService.updatePassword(req);
            res.status(200).send(Updated('Password updated successfully'));

        } catch (error) {
            next(error);
        }
};


export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const data = await usersService.deleteUser(userId);
        res.status(200).send(Deleted('User deleted successfully'));
    } catch (error) {
        next(error);
    }
};


export const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const data = await usersService.getUserById(userId, next);
        res.status(200).send(Retrieved('User retrieved successfully', data));

    } catch (error) {
        next(error);
    }
};

