import { Router } from "express";
import { loginController, logoutController, loginParticipantController, logoutParticipantController} from "../controllers/authController.js";
import { authenticateJWT } from '../middleware/authTokens.js';

const router = Router();

router.post('/login', loginController);
router.post('/logout', logoutController);

router.post('/login/participant', loginParticipantController);
router.post('/logout/participant',authenticateJWT, logoutParticipantController);

export default router;