import { apiDelete, apiGet, apiPatch, apiPost } from "../../../config/axiosIntance";
import { showErrorAlert, showSuccessAlert } from "../../actions/alertActions";


const routesMiddleware = {

    GenerateRoutes: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPost(`/v2/admin/route/create/${vendorId}`)
                    if (response?.success) {
                        resolve(response);
                        dispatch(showSuccessAlert(response?.message))
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    GetAllRoutes: (body) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPost("/v2/admin/route/all", body)
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

    GetRouteById: (routeId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`/v2/admin/route/${routeId}`)
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

    SendRoutesToRider: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPatch(`/v2/admin/route/assign-to-riders/${vendorId}`)
                    if (response?.success) {
                        dispatch(showSuccessAlert(response?.message))
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    DeleteRoutesForVendor: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiDelete(`/v2/admin/route/delete-routes/${vendorId}`)
                    if (response?.success) {
                        dispatch(showSuccessAlert(response?.message))
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

export default routesMiddleware;