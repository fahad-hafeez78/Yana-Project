import { Router } from "express";
import { createMenu, getAllMenus, getMenuById, updateMenu, deleteMenu, getMenuByIdWithMeals } from "../controllers/menusController.js";

const router = Router();

// GET /api/v1/meals/
router.post("/create", createMenu);
router.get("/get", getAllMenus);
router.get("/get/:id", getMenuById);
router.get("/getWithMeals/:id", getMenuByIdWithMeals);
router.put("/update/:id", updateMenu);
router.delete("/delete/:id", deleteMenu);

export default router;