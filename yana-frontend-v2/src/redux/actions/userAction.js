import { apiGet, apiPost } from '../../config/axiosIntance';
import { loginAsync, logoutAsync, UpdateUserData } from '../reducers/userReducer';
import { showErrorAlert, showSuccessAlert } from './alertActions';

export const login = (credentials) => async (dispatch) => {

    try {
        const response = await apiPost('v2/auth/login', credentials);
        if (response?.success) {
            dispatch(loginAsync(response));
            dispatch(showSuccessAlert(response?.message));
        }

    } catch (error) {
        dispatch(showErrorAlert(error));
    }
};

// Async logout action
export const logout = () => async (dispatch) => {
    try {
        const result = await apiPost('v2/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        dispatch(logoutAsync());
    }
};

export const updateUser = () => async (dispatch) => {

    try {
        const response = await apiGet('v2/admin/user/me');
        if (response?.success) {
            dispatch(UpdateUserData(response?.user));
        }

    } catch (error) {
        dispatch(showErrorAlert(error));
    }
};
