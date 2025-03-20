import schedule from "node-schedule";
import Orders from "../../models/Orders.js"
import OrderCutOffPeriods from "../../models/OrderCutOffPeriods.js"

const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
};

const updatePendingOrdersToActive = async () => {
    try {
        const pendingOrders = await Orders.find({ Status: 'Pending' });
        if (pendingOrders.length > 0) {
            const result = await Orders.updateMany(
                { _id: { $in: pendingOrders.map(order => order._id) } },
                { $set: { Status: 'Active' } }
            );
        }
    } catch (error) {
    }
};

export const updateOrdersStatus = async () => {

    const { closeDay } = await getCloseDay();

    if (closeDay !== undefined) {

        const todayIndex = new Date().getDay();
        if (todayIndex === closeDay) {
            schedule.scheduleJob({ dayOfWeek: closeDay, hour: 0, minute: 0 }, async () => {
                await updatePendingOrdersToActive();
            });
        }
        schedule.scheduleJob({ dayOfWeek: closeDay, hour: 12, minute: 0 }, async () => {
            await updatePendingOrdersToActive();
        });

    }
};

const getCloseDay = async () => {

    try {
        const days = await OrderCutOffPeriods.find();

        if (days.length > 0 && days[0].closeDay) {
            const closeDayNumber = dayMap[days[0].closeDay];
            return { closeDay: closeDayNumber };
        } else {
            return null;
        }

    } catch (error) {
        throw error;
    }
};
