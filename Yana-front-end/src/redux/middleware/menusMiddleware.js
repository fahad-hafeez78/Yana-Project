import { apiDelete, apiGet, apiPost, apiPut } from '../../config/axiosIntance';
import { showSuccessAlert } from '../actions/alertActions';

const menusMiddleware = {
    GetAllMenus: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {

                    const response = await apiGet('menus/get');

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

    GetMenuWithMeals: (menuId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {

                    const response = await apiGet(`menus/getWithMeals/${menuId}`);

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


    CreateNewMenus: (menuData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {

                    const response = await apiPost('menus/create', menuData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Menu created successfully"))
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

    UpdateMenus: (menuId, menu) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {
                    const response = await apiPut(`menus/update/${menuId}`, menu);
                    if (response.success) {
                        dispatch(showSuccessAlert("Menu updated Successfully"))
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

    DeleteMenu: (menuId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiDelete(`menus/delete/${menuId}`);

                    if (response.success) {
                        dispatch(showSuccessAlert("Menu Deleted Successfully"));
                        resolve(response);
                    } else {
                        dispatch(showErrorAlert("Error: Menu Not Deleted"));
                        reject(response);
                    }
                } catch (e) {

                    dispatch(showErrorAlert("Error: Menu Not Deleted"));
                    reject(e);
                }
            });
        };
    },



};


export default menusMiddleware;
