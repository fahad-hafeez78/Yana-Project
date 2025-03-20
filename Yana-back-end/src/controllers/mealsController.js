import * as mealsService from '../services/mealsService.js';
import { uploadMiddleware } from '../services/s3BucketService.js';
import { Created, Deleted, Retrieved, Updated } from '../utils/customResponses.js';

export const createMeal = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {

            if (err) return next({ status: 400, message: err.message });

            const data = await mealsService.createMeal(req);
            res.status(201).send(Created('Meal created successfully', data));

        } catch (error) {
            next(error);
        }
    });
};


export const getAllMeals = async (req, res, next) => {
    try {
        const data = await mealsService.getAllMeals();
        res.status(200).send(Retrieved('Meals retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};


export const updateMeal = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const data = await mealsService.updateMeal(req);
            res.status(200).send(Updated('Meal updated successfully', data));

        } catch (error) {
            next(error);
        }
    });
};


export const deleteMeal = async (req, res, next) => {
    try {
        const mealId = req.params.id;
        const data = await mealsService.deleteMeal(mealId);
        res.status(200).send(Deleted('Meal deleted successfully'));
    } catch (error) {
        next(error);
    }
};


export const getMealById = async (req, res, next) => {
    try {
        const mealId = req.params.id;
        const data = await mealsService.getMealById(mealId, next);
        res.status(200).send(Retrieved('Meal retrieved successfully', data));

    } catch (error) {
        next(error);
    }
};

// Filtered meals
export const getFilteredMeals = async (req, res, next) => {
    try {
        const { category, tags, participantId } = req.body;
        
        const data = await mealsService.getFilteredMeals(category, tags, participantId);
        res.status(200).send(Retrieved('Meals filtered successfully', data));

    } catch (error) {
        next(error);
    }
};

// Favourite Meals
export const createfavouriteMeal = async (req, res, next) => {
    try {
        const data = await mealsService.createfavouriteMeal(req);
        res.status(201).send(Created('Meal created successfully', data));

    } catch (error) {
        next(error);
    }
};

export const getAllfavouriteMeals = async (req, res, next) => {
    try {
        const data = await mealsService.getAllfavouriteMeals();
        res.status(200).send(Retrieved('Meals retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};

export const getfavouriteMealsData = async (req, res, next) => {
    try {
        const participantId = req.params.id;
        const data = await mealsService.getfavouriteMealsData(participantId);
        res.status(200).send(Retrieved('Meals data retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};

export const deletefavouriteMeal = async (req, res, next) => {
    try {
        const mealId = req.params.id;
        const data = await mealsService.deletefavouriteMeal(mealId);
        res.status(200).send(Deleted('Meal deleted successfully'));
    } catch (error) {
        next(error);
    }
};

