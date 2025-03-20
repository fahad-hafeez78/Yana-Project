import { Router } from "express";
import { getAssetLinkKey} from "../controllers/keyController.js";

const router = Router();
router.get('/assetlinks', getAssetLinkKey);

export default router;
