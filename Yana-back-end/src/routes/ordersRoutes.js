import { Router } from "express";
import { getAllOrders, getOrderById, createOrder, updateOrder, placeOrder, deleteOrder, createOrderCutOffPeriod, getOrderCutOffPeriod } from "../controllers/ordersController.js";

const router = Router();

// GET /api/v1/orders/
router.post("/create", createOrder);
router.post("/placeorder/:id", placeOrder);

router.get("/get", getAllOrders);
router.get("/get/:id", getOrderById);
router.put("/update/:id", updateOrder);

router.delete("/delete/:id", deleteOrder);
router.delete("/delete/ByParticipantId:id", deleteOrder);

router.put("/cutOffPeriod", createOrderCutOffPeriod);
router.get("/cutOffPeriod", getOrderCutOffPeriod);

export default router;