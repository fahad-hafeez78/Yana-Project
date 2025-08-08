import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../../config/axiosIntance";
import { showErrorAlert, showSuccessAlert } from "../actions/alertActions";

const trashItemsMiddleware = {

    GetTrashedVendors: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet("v2/admin/vendor/deleted-vendors");
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

    GetTrashedOrders: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet("v2/admin/order/soft-deleted-orders");
                    if (response.success) {
                        resolve(response);
                    }
                } catch (e) {
                    dispatch(showErrorAlert(e))
                    reject(e);
                }
            });
        };
    },

    RestoreOrder: (orderId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const body = {
                        "ids": [orderId],
                        "status": "active"
                    }
                    const response = await apiPut("v2/admin/order/bulk-status-update", body);
                    if (response.success) {
                        dispatch(showSuccessAlert("Order Restored Successfully"))
                        resolve(response);
                    }
                } catch (e) {
                    dispatch(showErrorAlert(e))
                    reject(e);
                }
            });
        };
    },
    RestoreVendor: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const body = {
                        "status": "active"
                    }
                    const response = await apiPatch(`v2/admin/vendor/${vendorId}`, body);
                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message))
                        resolve(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    dispatch(showErrorAlert(e))
                    reject(e);
                }
            });
        };
    },
    DeleteOrder: (orderId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiDelete(`v2/admin/order/permanent-delete/${orderId}`);
                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message))
                        resolve(response);
                    }
                } catch (e) {
                    dispatch(showErrorAlert(e))
                    reject(e);
                }
            });
        };
    },
    DeleteVendor: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiDelete(`v2/admin/vendor/permanent-delete/${vendorId}`);
                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message))
                        resolve(response);
                    }
                } catch (e) {
                    dispatch(showErrorAlert(e))
                    reject(e);
                }
            });
        };
    },

}

export default trashItemsMiddleware;