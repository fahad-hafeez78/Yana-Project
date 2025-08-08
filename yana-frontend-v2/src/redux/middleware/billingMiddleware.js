import { apiDelete, apiGet, apiPost, apiPut } from "../../config/axiosIntance";
import { showErrorAlert, showSuccessAlert } from "../actions/alertActions";

const billingMiddleware = {
    GetAllClaim: (tabCurrentStatus) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`v2/admin/claim/all?status=${tabCurrentStatus}`)

                    if (response.success) {
                        resolve(response);
                    }
                } catch (error) {
                    reject(error);
                    dispatch(showErrorAlert(error));
                }
            });
        };
    },

    GetStatsWithClaim: (period = 'month', month, year = 2025) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let query = period === 'month' ?
                        `v2/admin/claim/statistics?period=${period}&month=${month}&year=${year}` :
                        `v2/admin/claim/statistics?period=${period}&year=${year}`;

                    const response = await apiGet(query)

                    if (response.success) {
                        resolve(response);
                    }
                } catch (error) {
                    reject(error);
                    dispatch(showErrorAlert(error));
                }
            });
        };
    },


    CreateNewClaim: (claimBody) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPost("v2/admin/claim/create", claimBody)

                    if (response.success) {
                        resolve(response);
                        dispatch(showSuccessAlert(response?.message))
                    }
                } catch (error) {
                    reject(error);
                    dispatch(showErrorAlert(error))
                }
            });
        };
    },

    UpdateClaim: (claimId, claimBody) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPut(`v2/admin/claim/${claimId}`, claimBody)

                    if (response.success) {
                        resolve(response);
                        dispatch(showSuccessAlert(response?.message))
                    }
                } catch (error) {
                    reject(error);
                    dispatch(showErrorAlert(error))
                }
            });
        };
    },

    DeleteClaim: (claimId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiDelete(`v2/admin/claim/${claimId}`)
                    if (response?.success) {
                        resolve(response);
                        dispatch(showSuccessAlert(response?.message))
                    }
                } catch (error) {
                    reject(error);
                    dispatch(showErrorAlert(error))
                }
            });
        };
    },

}

export default billingMiddleware;