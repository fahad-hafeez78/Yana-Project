import { apiGet, apiPatch, apiPost, apiPut } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';

const ordersMiddleware = {
    GetAllOrders: (tabCurrentStatus) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let response;
                    if (tabCurrentStatus !== null) {
                        response = await apiGet(`v2/admin/order/all?status=${tabCurrentStatus}`);
                    } else {
                        response = await apiGet(`v2/admin/order/all`);
                    }

                    if (response.success) {
                        resolve(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    GetOrdersByParticipantId: (participantId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`v2/admin/order/latest-orders/${participantId}`);
                    if (response.success) {
                        resolve(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    UpdateOrder: (orderId, orderDetails) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPatch(`v2/admin/order/${orderId}`, orderDetails);

                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    SoftDeleteOrder: (orderId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPatch(`v2/admin/order/soft-delete/${orderId}`);

                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    ExportAllOrders: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet("/admin/api/export/orders");

                    if (response.success) {
                        // dispatch(showSuccessAlert("Logged in successfully"));
                        resolve(response);
                    } else {
                        // dispatch(LoaderAction.LoaderFalse());
                        reject(response);
                    }
                } catch (e) {
                    // dispatch(LoaderAction.LoaderFalse());
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    PlaceNewOrder: (orderToSubmit) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost('v2/admin/order/create', orderToSubmit);

                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    GetStartCut: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet('v2/admin/order/order-placing-duration');
                    if (response?.success) {
                        resolve(response);
                    }
                } catch (e) {
                    dispatch(showErrorAlert(e));
                    reject(e);
                }
            });
        };
    },

    UpsrtStartCut: (selectedDays) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPut('v2/admin/order/update-order-placing-duration', selectedDays);
                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    ChangeStatusInBulk: (bulkChangeBody) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPut("v2/admin/order/bulk-status-update", bulkChangeBody);

                    if (response?.success) {
                        dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    }
                } catch (e) {
                    dispatch(showErrorAlert(e));
                    reject(e);
                }
            });
        };
    },

};


export default ordersMiddleware;
