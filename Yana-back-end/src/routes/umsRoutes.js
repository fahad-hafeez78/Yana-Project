import { Router } from "express";
import { createUser, getAllUsers, getUserById, updateUser, updatePassword , deleteUser } from "../controllers/umsController.js";

const router = Router();

// GET /api/v1/ums/
router.post("/create", createUser);
router.get("/get", getAllUsers);
router.get("/get/:id", getUserById);
router.put("/update/:id", updateUser);
router.put("/update/password/:id", updatePassword);
router.delete("/delete/:id", deleteUser);

export default router;