import { apiGet, apiPost, apiPut } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';

const menusMiddleware = {
    GetAllAssignements: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {

                    const response = await apiPost('v2/admin/menu/fetch-assigned-menus', vendorId);

                    if (response.success) {
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

    CreateAssignments: (assignementData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {

                    const response = await apiPost('/admin/api/weekassignment/', assignementData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Assignment created successfully"))
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

    UpdateAssignments: (assignementData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {
                    const response = await apiPost('v2/admin/menu/update-assigned-menus', assignementData);
                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message))
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


export default menusMiddleware;
