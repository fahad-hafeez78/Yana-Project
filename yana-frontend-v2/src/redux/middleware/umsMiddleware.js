import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';
import { loginAsync, logoutAsync } from '../reducers/userReducer';

const umsMiddleware = {
    AddNewAdmin: (adminData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost('v2/admin/user/create-user', adminData);

                    if (response.success) {
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

    GetAllUsers: (status = "all") => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet(`v2/admin/user/all?status=${status}`);

                    if (response.success) {
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },


    GetUserById: (userId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet(`/admin/api/user/${userId}`);

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

    GetUsersByRoleId: (roleId, type = '') => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`v2/admin/user/users-by-roleId?roleId=${roleId}&type=${type}`);

                    if (response.success) {
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error))
                    reject(error);
                }
            });
        };
    },

    UpdateAdmin: (userId, userData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPatch(`v2/admin/user/${userId}`, userData);

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

    UpdateUserStatus: (userId, userData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPatch(`v2/admin/user/update-status-by-admin/${userId}`, userData);

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

    DeleteAdmin: (userId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiDelete(`v2/admin/user/${userId}`);

                    if (response.success) {

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

    DeleteRole: (userId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiDelete(`v2/admin/role/${userId}`);

                    if (response.success) {

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


    changeUserPassword: (oldPassword, NewPassword) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost('v2/auth/change-password',
                        {
                            "oldPassword": oldPassword,
                            "newPassword": NewPassword,
                        })

                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message))
                        dispatch(logoutAsync())
                        resolve(response);
                    }
                } catch (e) {
                    dispatch(showErrorAlert(e));
                    reject(e);
                }
            });
        };
    },

    ForgetPasswordGetOTP: (body) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost('v2/auth/forgot-password', body)

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

    ForgetPasswordVerifyOTP: (body) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost('v2/auth/verify-otp', body)

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

    ResetPassword: (body) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPost('v2/auth/reset-password', body)
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


export default umsMiddleware;
