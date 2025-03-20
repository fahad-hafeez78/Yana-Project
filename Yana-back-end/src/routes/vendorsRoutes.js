import { Router } from "express";
import { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor } from "../controllers/vendorsController.js";

const router = Router();

// GET /api/v1/meals/
router.post("/create", createVendor);
router.get("/get", getAllVendors);
router.get("/get/:id", getVendorById);
router.put("/update/:id", updateVendor);
router.delete("/delete/:id", deleteVendor);

export default router;