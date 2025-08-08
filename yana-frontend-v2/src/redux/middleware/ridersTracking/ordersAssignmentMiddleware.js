import { apiGet, apiPatch } from "../../../config/axiosIntance";
import { showErrorAlert, showSuccessAlert } from "../../actions/alertActions";

const ordersAssignmentMiddleware = {
    GetUnAssignedOrders: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet("/v2/admin/route/unassigned-zone-orders")
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

    AssignedZoneToOrder: (body) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPatch("/v2/admin/route/assign-zone-to-order", body);

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

export default ordersAssignmentMiddleware;