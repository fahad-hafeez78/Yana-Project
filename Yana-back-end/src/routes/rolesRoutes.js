import { Router } from "express";
import { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getPermissionsByRoleName } from "../controllers/rolesController.js";

const router = Router();

// GET /api/v1/roles/
router.post("/create", createRole);
router.get("/get", getAllRoles);
router.get("/get/:id", getRoleById);
router.get("/get/permissions/:id", getPermissionsByRoleName);
router.put("/update/:id", updateRole);
router.delete("/delete/:id", deleteRole);

export default router;