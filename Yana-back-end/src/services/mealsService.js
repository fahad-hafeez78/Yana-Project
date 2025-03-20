import { deleteFromS3, uploadToS3 } from './s3BucketService.js';
import { DuplicateKey, NotCreated, NotDeleted, NotFound, NotUpdated } from '../utils/customErrors.js';
import Meals from '../models/Meals.js';
import Menus from '../models/Menus.js';
import FavouriteMeals from '../models/FavouriteMeals.js';
import Participants from '../models/Participants.js';
import WeekAssignments from '../models/WeekAssignments.js';
import moment from 'moment';

export const createMeal = async (req) => {
    try {
        const imageUrl = await uploadToS3(req.file, 'meals');
        const newData = { image: imageUrl, ...req.body };
        const newMeal = new Meals(newData);
        const data = await newMeal.save();
        if (!data) {
            throw NotCreated('Meal not created');
        }
        return data;

    } catch (error) {
        if (error.code === 11000) {
            throw DuplicateKey(error.keyPattern)
        }
        throw error;
    }
}

export const getAllMeals = async () => {
    try {
        const data = await Meals.find();

        if (data.length === 0) {
            throw NotFound('Meals not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getMealById = async (mealId) => {
    try {
        const data = await Meals.findById(mealId);
        if (!data) {
            throw NotFound('Meal not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const updateMeal = async (req) => {

    try {
        const mealData = req.body;
        const mealId = req.params.id;
        let imageUrl = '';

        //delete old image from s3 and add new image
        const oldMeal = await getMealById(mealId);
        if (req.file) {
            const imageKey = oldMeal?.image?.split(`.amazonaws.com/`)[1] || null;
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
            if (req.file && oldMeal)
                imageUrl = await uploadToS3(req.file, 'meals')
            mealData.image = imageUrl;
        }

        const data = await Meals.findByIdAndUpdate(
            mealId,
            mealData,
            { new: true, runValidators: true }
        );

        if (!data) {
            throw NotUpdated('Meal not updated');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const deleteMeal = async (mealId) => {
    try {
        const meal = await getMealById(mealId);
        if (meal?.image) {
            const imageKey = meal.image?.split(`.amazonaws.com/`)[1];
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
        }
        const data = await Meals.findByIdAndDelete(mealId);
        if (!data) {
            throw NotDeleted('Meal not deletd');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

// Favourite meals List
export const createfavouriteMeal = async (req) => {
    try {
        const newMeal = new FavouriteMeals(req.body);
        const data = await newMeal.save();
        if (!data) {
            throw NotCreated('Meal not created');
        }
        return data;

    } catch (error) {
        if (error.code === 11000) {
            throw DuplicateKey(error.keyPattern)
        }
        throw error;
    }
}

export const getAllfavouriteMeals = async () => {
    try {
        const data = await FavouriteMeals.find();

        if (data.length === 0) {
            throw NotFound('Meals not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getfavouriteMealsData = async (participantId) => {
    try {
        const data = await FavouriteMeals.find({ participantId })
            .populate({ path: 'meals', model: 'Meals' })

        if (data.length === 0) {
            throw NotFound('Meals not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const deletefavouriteMeal = async (mealId) => {
    try {

        const data = await FavouriteMeals.findByIdAndDelete(mealId);
        if (!data) {
            throw NotDeleted('Meal not deleted');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

// Get filterd meals list
export const getFilteredMeals = async (category, tags, participantId) => {

    try {
        let filter = { status: "Available" };
        if (category && category !== "false" && category !== "All") {
            filter.category = category;
        }

        const trueTags = Object.keys(tags).filter((tag) => tags[tag]);
        const weekAssignment = await WeekAssignments.findOne();
        
        let meals;
        meals = await Meals.find(filter);

        if (weekAssignment) {
            const dateFormat = "MM-DD-YYYY";
            const today = moment().format(dateFormat);
            let currentWeek = null;

            ["week1", "week2", "week3", "week4"].forEach((weekKey) => {
                if (!currentWeek && Array.isArray(weekAssignment[weekKey])) {
                    for (const week of weekAssignment[weekKey]) {
                        const startDate = moment(week.Startdt, dateFormat, true);
                        const endDate = moment(week.Enddt, dateFormat, true);
                        if (moment(today, dateFormat).isBetween(startDate, endDate, undefined, "[]")) {
                            currentWeek = week;
                            break;
                        }
                    }
                }
            });

            if (currentWeek) {
                const menuIDs = currentWeek.Menus.map((menu) => menu.MenuID);
                const menus = await Menus.find({ _id: { $in: menuIDs } }).populate({
                    path: "meals",
                    model: "Meals",
                });

                const menuDishIDs = menus.flatMap((menu) =>
                    menu.meals.map((meal) => meal._id)
                );
                meals = meals.filter(meal => menuDishIDs.includes(meal._id));
            }
        }
        
        if (trueTags.length > 0) {
            meals = meals.filter((meal) => {
                if (meal.tags.length === 0) return false;
                const mealTags = JSON.parse(meal.tags[0]);
                return trueTags.every((tag) => mealTags[tag] === true);
            });
        }

        const favDishes = await FavouriteMeals.find({ participantId }).populate({
            path: "meals",
            model: "Meals",
        });
        const favDishIds = favDishes.map((fav) => fav.meals._id);
        
        const filteredDishesWithFavStatus = meals
            .filter((meal) => {
                const mealTags = JSON.parse(meal.tags[0]);
                return trueTags.every((tag) => mealTags[tag] === true);
            })
            .map((meal) => ({
                ...meal.toObject(),
                isFav: favDishIds.includes(meal._id),
            }));

        const participant = await Participants.findById(participantId, "Status PauseEndDt");

        return {
            success: true,
            filteredDishesWithFavStatus,
            customerStatus: participant?.Status || null,
            PauseEndDt: participant?.PauseEndDt || null,
        };
    } catch (error) {
        throw error
    }
};