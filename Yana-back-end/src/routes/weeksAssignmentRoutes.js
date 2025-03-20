import { Router } from "express";
import { createWeeksAssignment, getAllWeeksAssignments, updateWeeksAssignment} from "../controllers/weeksAssignmentController.js";

const router = Router();

// GET /api/v1/weeksAssignment/
router.post("/create", createWeeksAssignment);
router.get("/get", getAllWeeksAssignments);
router.put("/update", updateWeeksAssignment);
export default router;