import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';

const vendorsMiddleware = {
    GetAllVendors: (status) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet(`v2/admin/vendor/all?filter=${status}`);

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

    UpdateVendor: (vendorId, vendorData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPatch(`v2/admin/vendor/${vendorId}`, vendorData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Vendor Status Updated Successfully"));
                        resolve(response);
                    } else {
                        reject(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    AddVendor: (vendorData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPost(`/admin/api/vendors/`, vendorData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Vendor Created Successfully"));
                        resolve(response);
                    } else {
                        reject(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    DelVendor: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPatch(`v2/admin/vendor/soft-delete/${vendorId}`);

                    if (response.success) {
                        dispatch(showSuccessAlert("Vendor Deleted Successfully"));
                        resolve(response);
                    }
                } catch (e) {
                    dispatch(showErrorAlert(e))
                    reject(e);
                }
            });
        };
    },

    GetVendorDishStats: (vendorId, status) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`v2/admin/order/vendor-meals-stats/${vendorId}/${status}`);
                    if (response.success) {
                        resolve(response);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        };
    },

};


export default vendorsMiddleware;
