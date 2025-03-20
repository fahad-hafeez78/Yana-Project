import { Router } from "express";
import { getAllParticipantChanges, getParticipantChangesById, deleteParticipantChanges, approveParticipantChanges } from "../controllers/participantsChangesController.js";

const router = Router();

router.put("/approveChanges/:id", approveParticipantChanges);
router.get("/get", getAllParticipantChanges);
router.get("/get/:id", getParticipantChangesById);
router.delete("/delete/:id", deleteParticipantChanges);

export default router;