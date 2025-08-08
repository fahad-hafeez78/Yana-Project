import { apiDelete, apiGet, apiPatch, apiPost } from "../../../config/axiosIntance";
import { showErrorAlert, showSuccessAlert } from "../../actions/alertActions";


const ridersMiddleware = {
    CreateRider: (payload) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPost("v2/admin/rider/create", payload)

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
    UpdateRider: (riderId, payload) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPatch(`v2/admin/rider/${riderId}`, payload)

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

    GetAllRiders: (tabCurrentStatus) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`/v2/admin/rider/all?status=${tabCurrentStatus}`)
                    if (response?.success) {
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },
    DeleteRider: (riderId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiDelete(`v2/admin/rider/${riderId}`)
                    if (response?.success) {
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


}

export default ridersMiddleware;