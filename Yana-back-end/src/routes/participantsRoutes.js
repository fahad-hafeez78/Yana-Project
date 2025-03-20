import { Router } from "express";
import { createParticipant, importParticipants, getAllParticipants, getParticipantById, getActiveParticipants, updateParticipant, generateParticipantCredentials, deleteParticipant, createParticipantRequest, getAllParticipantsRequests, updateParticipantRequest } from "../controllers/participantsController.js";

const router = Router();

// GET /api/v1/participants/
router.post("/create", createParticipant);
router.post("/import", importParticipants);
router.get("/get", getAllParticipants);
router.get("/get/:id", getParticipantById);
router.put("/update/:id", updateParticipant);
router.delete("/delete/:id", deleteParticipant);

router.get("/active", getActiveParticipants);
router.put("/update/generateCredentials/:id", generateParticipantCredentials);

router.post("/create/request", createParticipantRequest);
router.get("/get/request", getAllParticipantsRequests);
router.put("/update/request", updateParticipantRequest);
export default router;