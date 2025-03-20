import { apiPost } from '../../config/axiosIntance';
import { loginAsync, logoutAsync, UpdateUserData } from '../reducers/userReducer';
import { showErrorAlert, showSuccessAlert } from './alertActions';

export const login = (credentials) => async (dispatch) => {
    try {

        const result = await apiPost('auth/login', credentials);

        if (result?.success) {
            dispatch(loginAsync(result.data));
            dispatch(showSuccessAlert("Logged in successfully"));
        }

    } catch (error) {
        dispatch(showErrorAlert(error?.response?.data?.message));
    }
};

export const logout = () => async (dispatch) => {
    try {
        const result = await apiPost('auth/logout');
        if (result?.success) {
            dispatch(logoutAsync(result));
            dispatch(showSuccessAlert("Logged out successfully"));
        }

    } catch (error) {
        dispatch(showErrorAlert(error?.response?.data?.message));
    }
};

export const updateUser = (data) => async (dispatch) => {

    try {
        dispatch(UpdateUserData(data));

    } catch (error) {
        dispatch(showErrorAlert(error?.response?.data?.message));
    }
};
