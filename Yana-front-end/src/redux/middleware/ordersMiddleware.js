import { apiGet, apiPost, apiPut } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';

const ordersMiddleware = {
    GetAllOrders: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet("orders/get");
                    resolve(response);
                    // if (response.success) {
                    //     resolve(response);
                    // } else {
                    //     reject(response);
                    // }
                } catch (e) {
                    dispatch(showErrorAlert(e.message));
                    reject(e);
                }
            });
        };
    },

    UpdateOrder: (orderId, OrderDetails) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPut(`orders/update/${orderId}`, OrderDetails);

                    if (response.success) {
                        dispatch(showSuccessAlert("Order Updated Successfully"));
                        resolve(response);
                    } else {
                        // dispatch(LoaderAction.LoaderFalse());
                        reject(response);
                    }
                } catch (e) {
                    // dispatch(LoaderAction.LoaderFalse());
                    console.log('Error fetching single product:', e);
                    reject(e);
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
                    
                    const response = await apiPost('orders/create', orderToSubmit);

                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                } catch (e) {
                    dispatch(LoaderAction.LoaderFalse());
                    console.log('Error fetching single product:', e);
                    reject(e);
                }
            });
        };
    },

    GetStartCut: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    
                    const response = await apiGet('orders/cutOffPeriod');
                    if (response.success) {
                        // dispatch(LoaderAction.LoaderFalse());
                        resolve(response);
                    } else {
                        // dispatch(LoaderAction.LoaderFalse());
                        reject(response);
                    }
                } catch (e) {
                    dispatch(LoaderAction.LoaderFalse());
                    console.log('Error fetching start & cut off day:', e);
                    reject(e);
                }
            });
        };
    },

    UpsrtStartCut: (selectedDays) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    
                    const response = await apiPut('orders/cutOffPeriod', selectedDays);
                    if (response.success) {
                        // dispatch(LoaderAction.LoaderFalse());
                        resolve(response);
                    } else {
                        // dispatch(LoaderAction.LoaderFalse());
                        reject(response);
                    }
                } catch (e) {
                    dispatch(LoaderAction.LoaderFalse());
                    console.log('Error fetching start & cut off day:', e);
                    reject(e);
                }
            });
        };
    },

};


export default ordersMiddleware;
