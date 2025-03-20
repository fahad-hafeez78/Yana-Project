import Orders from '../models/Orders.js';
import Participants from '../models/Participants.js';
import { NotCreated, NotDeleted, NotFound, NotUpdated } from '../utils/customErrors.js';
import OrderCutOffPeriods from '../models/OrderCutOffPeriods.js';

export const createOrder = async (req) => {
    try {

        const newOrders = new Orders(req.body);
        const data = await newOrders.save();

        if (!data) {
            throw NotCreated('Order not created');
        }
        return data;

    } catch (error) {
        throw error;
    }
}

export const placeOrder = async (participantId, orderData) => {
    try {
        const participant = await Participants.findById(participantId);
        if (!participant) {
            return { success: false, message: "Participant not found" };
        }

        const existingOrder = await Orders.findOne({
            participantId: participantId,
            Status: { $in: ["Pending", "Active"] }
        });

        const days = await OrderCutOffPeriods.find();
        const closeDay = days[0].closeDay;

        if (existingOrder) {
            return { success: false, message: `You have already placed an order this week. You can order again after ${closeDay}.` };
        }
        const totalOrderUnits = orderData.mealIDsList.reduce((total, mealItem) => {
            return total + (mealItem.Count);
        }, 0);

        const formattedOrderData = {
            ...orderData,
            participantId: participantId,
            OrderUnits: totalOrderUnits,
            OrderPlaceDateTime: new Date().toISOString(),
            Status: "Pending"
        };

        const newOrder = new Orders(formattedOrderData);
        const data = await newOrder.save();
        return data;

    } catch (error) {
        throw error;
    }
}


export const getAllOrders = async () => {
    try {

        const data = await Orders.find()
        // .populate({
        //     path: 'participantId',
        //     select: 'Name -_id',
        // });
        if (data.length === 0) {
            throw NotFound('Orders not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
}

export const getOrderById = async (orderId) => {
    try {
        const data = await Orders.findById(orderId);
        if (!data) {
            throw NotFound('Order not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
}

export const updateOrder = async (req) => {
    try {
        const orderData = req.body;
        const orderId = req.params.id;

        const data = await Orders.findByIdAndUpdate(
            orderId,
            orderData,
            { new: true, runValidators: true }
        );

        if (!data) {
            throw NotUpdated('Order not updated');
        }
        return data;

    } catch (error) {
        throw error;
    }
}

export const deleteOrder = async (orderId) => {
    try {

        const findOrder = await getOrderById(orderId);
        const data = await Orders.findByIdAndDelete(orderId);

        if (!data) {
            throw NotDeleted("Order not deleted")
        }
        return data;

    }
    catch (error) {
        throw error;
    }
}


export const createOrderCutOffPeriod = async (req) => {
    try {
        const { startDay, closeDay } = req.body;
        if (!startDay || !closeDay) {
            throw new Error("Start day and close day is required");
        }

        const orderCutOffPeriodResponse = await OrderCutOffPeriods.findOneAndUpdate(
            {},
            { startDay, closeDay },
            { upsert: true, new: true }
        );
        if (!orderCutOffPeriodResponse) {
            throw new Error('Order CutOff Period not created/updated successfully');
        }

        return orderCutOffPeriodResponse;

    } catch (error) {
        throw error;
    }
}

export const getOrderCutOffPeriod = async () => {
    try {

        const data = await OrderCutOffPeriods.find();
        if (data.length === 0) {
            throw NotFound('Order CutOff Periods not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
}


export const deleteOrdersByParticipantsId = async (participantId) => {
    try {
        const data = await Orders.deleteMany({ participantId: participantId });
        if (!data) {
            throw NotDeleted("Order not deleted")
        }

    } catch (error) {
        throw error;
    }
};