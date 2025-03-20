import { Created, Retrieved, Updated, Deleted } from '../utils/customResponses.js';
import * as ordersService from '../services/ordersService.js';

export const createOrder = async (req, res, next) => {
    try {
        const data = await ordersService.createOrder(req);
        res.status(201).send(Created('Order created successfully', data));
    } catch (error) {
        next(error);
    }
};

export const placeOrder = async (req, res, next) => {
    try {
        const participantId = req.params.id;
        const data = await ordersService.placeOrder(participantId, req.body);
        res.status(201).send(Created('Order created successfully', data));
    } catch (error) {
        next(error);
    }
};


export const getAllOrders = async (req, res, next) => {
    try {
        const data = await ordersService.getAllOrders();
        res.status(200).json(Retrieved('Orders retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};

export const updateOrder = async (req, res, next) => {
    try {
        const data = await ordersService.updateOrder(req);
        res.status(200).send(Updated('Order updated successfully', data));
    } catch (error) {
        next(error);
    }
}

export const deleteOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const data =await ordersService.deleteOrder(orderId);
        res.status(200).send(Deleted('Order deleted successfully'));
    }
    catch (error) {
        next(error);
    }
}

export const deleteOrdersByParticipantsId = async (req, res, next) => {
    try {
        const participantId = req.params.id;
        const data =await ordersService.deleteOrdersByParticipantsId(participantId);
        res.status(200).send(Deleted('Order deleted successfully'));
    }
    catch (error) {
        next(error);
    }
}

export const getOrderById = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const data = await ordersService.getOrderById(orderId);
        res.status(200).send(Retrieved('Order retrieved successfully', data));
    } catch (error) {
        next(error);
    }
}

export const createOrderCutOffPeriod = async (req, res, next) => {
    try {
        
        const data = await ordersService.createOrderCutOffPeriod(req);
        res.status(201).send(Created('OrderCutOffPeriod created successfully', data));
    } catch (error) {
        next(error);
    }
};

export const getOrderCutOffPeriod = async (req, res, next) => {
    try {
        const data = await ordersService.getOrderCutOffPeriod();
        res.status(200).send(Retrieved('OrderCutOffPeriods retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};