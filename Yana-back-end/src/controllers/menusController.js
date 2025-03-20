import * as menusService from '../services/menusService.js';
import { uploadMiddleware } from '../services/s3BucketService.js';
import { Created, Deleted, Retrieved, Updated } from '../utils/customResponses.js';

export const createMenu = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            
            if (err) return next({ status: 400, message: err.message });

            const data = await menusService.createMenu(req);
            res.status(201).send(Created('Menu created successfully', data));

        } catch (error) {
            next(error);
        }
    });
};


export const getAllMenus = async (req, res, next) => {
    try {
        const data = await menusService.getAllMenus();
        res.status(200).send(Retrieved('Menus retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};


export const updateMenu = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const data = await menusService.updateMenu(req);
            res.status(200).send(Updated('Menu updated successfully', data));

        } catch (error) {
            next(error);
        }
    });
};


export const deleteMenu = async (req, res, next) => {
    try {
        const menuId = req.params.id;
        const data = await menusService.deleteMenu(menuId);
        res.status(200).send(Deleted('Menu deleted successfully'));
    } catch (error) {
        next(error);
    }
};


export const getMenuById = async (req, res, next) => {
    try {
        const menuId = req.params.id;
        const data = await menusService.getMenuById(menuId, next);
        res.status(200).send(Retrieved('Menu retrieved successfully', data));

    } catch (error) {
        next(error);
    }
};

export const getMenuByIdWithMeals = async (req, res, next) => {
    try {
        const menuId = req.params.id;
        const data = await menusService.getMenuByIdWithMeals(menuId, next);
        res.status(200).send(Retrieved('Menu retrieved successfully', data));

    } catch (error) {
        next(error);
    }
};
