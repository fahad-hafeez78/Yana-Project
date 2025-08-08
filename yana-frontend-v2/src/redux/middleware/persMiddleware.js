import { apiGet } from "../../config/axiosIntance";
import { showErrorAlert } from "../actions/alertActions";

const persMiddleware = {
    GetPersParticipants: (tabCurrentStatus) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`/v2/admin/customer/all-pers-customers?pers_status=${tabCurrentStatus}`)
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

}

export default persMiddleware;