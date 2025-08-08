import { apiPatch, apiPost } from "../../config/axiosIntance";
import { showErrorAlert, showSuccessAlert } from "../actions/alertActions";

const tasksMiddleware = {

    CreateNewTask: (body) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost("v2/admin/task/create", body);

                    if (response?.success) {
                        dispatch(showSuccessAlert(response?.message))
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error))
                    reject(error);
                }
            });
        };
    },

    GetAllTasks: (body) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost("v2/admin/task/all-tasks", body);

                    if (response?.success) {
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

    UpdateTask: (taslId, body) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPatch(`v2/admin/task/${taslId}`, body);

                    if (response?.success) {
                        dispatch(showSuccessAlert(response?.message))
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error))
                    reject(error);
                }
            });
        };
    },

}

export default tasksMiddleware;