import { apiDelete, apiGet, apiPatch, apiPost } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';

const mealsMiddleware = {
    GetAllMeals: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet('v2/admin/meal/all')

                    if (response.success) {
                        // dispatch(showSuccessAlert("Logged in successfully"));
                        resolve(response);
                    }
                } catch (e) {
                    // dispatch(LoaderAction.LoaderFalse());
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    CreateNewMeal: (mealData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    
                    const response = await apiPost('v2/admin/meal', mealData);

                    if (response.success) {
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
    
    UpdateMeal: (mealId, mealData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    
                    const response = await apiPatch(`v2/admin/meal/${mealId}`, mealData);
                    
                    if (response.success) {
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

    GetMealsByVendorId: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    
                    const response = await apiGet(`v2/admin/meal/vendor-meals/${vendorId}`);
                    
                    if (response.success) {
                        // dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    } 
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    GetActiveAssignedMealsByVendorId: (vendorId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`v2/admin/meal/assigned-week/active-meals/${vendorId}`);
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
    
    DeleteMeal: (mealId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {

                try {
                    const response = await apiDelete(`v2/admin/meal/delete/${mealId}`);
                    if (response?.success) {
                        dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(e);
                }
            });
        };
    },



    // UpdateMealStatus: (mealBody) => {
    //     return async (dispatch, getState) => {
    //         return new Promise(async (resolve, reject) => {
    //             try {
    //                 const response = await apiPost(`/admin/api/dishes/status`, mealBody);

    //                 if (response.success) {
    //                     dispatch(showSuccessAlert("Meal status updated Successfully"));
    //                     resolve(response);
    //                 } else {
    //                     dispatch(showErrorAlert("Error: Meal status not updated"));
    //                     reject(response);
    //                 }
    //             } catch (e) {

    //                 dispatch(showErrorAlert("Error: eal status not updated"));
    //                 reject(e);
    //             }
    //         });
    //     };
    // },

};


export default mealsMiddleware;
