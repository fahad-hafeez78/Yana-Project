import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../config/axiosIntance';
import { showSuccessAlert } from '../actions/alertActions';

const menusMiddleware = {
    GetAllMenus: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {

                    const response = await apiGet('v2/admin/menu');

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

    GetMenusByVendorId: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`v2/admin/menu/vendor-menus/${vendorId}`);
                    
                    if (response.success) {
                        resolve(response);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        };
    },

    CreateNewMenus: (menuData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {

                    const response = await apiPost('v2/admin/menu', menuData);

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
                    const response = await apiPatch(`v2/admin/menu/${menuId}`, menu);
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
                    
                    const response = await apiDelete(`v2/admin/menu/${menuId}`);
                    
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



};


export default menusMiddleware;
