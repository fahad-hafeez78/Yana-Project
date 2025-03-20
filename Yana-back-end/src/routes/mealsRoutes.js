import { Router } from "express";
import { createMeal, getAllMeals, getMealById, getFilteredMeals, updateMeal, deleteMeal, createfavouriteMeal, getfavouriteMealsData, getAllfavouriteMeals, deletefavouriteMeal } from "../controllers/mealsController.js";

const router = Router();

// GET /api/v1/meals/
router.post("/create", createMeal);
router.get("/get", getAllMeals);
router.get("/get/:id", getMealById);
router.put("/update/:id", updateMeal);
router.delete("/delete/:id", deleteMeal);

// Get filtered meal list
router.post("/get/filter", getFilteredMeals);

// Get favorite meal list
router.post("/favourite", createfavouriteMeal);
router.get("/favourite", getAllfavouriteMeals);
router.get("/favourite/data/:id", getfavouriteMealsData);
router.delete("/favourite/:id", deletefavouriteMeal);
export default router;