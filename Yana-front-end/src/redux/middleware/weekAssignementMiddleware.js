import { apiGet, apiPost, apiPut } from '../../config/axiosIntance';
import { showSuccessAlert } from '../actions/alertActions';

const menusMiddleware = {
    GetAllAssignements: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {

                    const response = await apiGet('weeksAssignment/get');

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

                    const response = await apiPost('weeksAssignment/create', assignementData);

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

    UpdateAssignments: ( assignementData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {

                    const response = await apiPut(`weeksAssignment/update`, assignementData);


                    if (response.success) {
                        dispatch(showSuccessAlert("Assignment updated Successfully"))
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

};


export default menusMiddleware;
