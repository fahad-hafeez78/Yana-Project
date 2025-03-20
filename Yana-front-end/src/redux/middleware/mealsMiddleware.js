import { apiDelete, apiGet, apiPost, apiPut } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';

const mealsMiddleware = {
    GetAllMeals: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet('meals/get')

                    if (response.success) {
                        // dispatch(showSuccessAlert("Logged in successfully"));
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

    CreateNewMeal: (mealData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPost('meals/create', mealData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Meal added Successfully"));
                        resolve(response);
                    } else {
                        dispatch(showErrorAlert("Error: Meal Not Added"));
                        reject(response);
                    }
                } catch (e) {

                    dispatch(showErrorAlert("Error: Meal Not Added"));
                    reject(e);
                }
            });
        };
    },

    UpdateMeal: (mealId, mealData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    
                    const response = await apiPut(`meals/update/${mealId}`, mealData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Meal Updated Successfully"));
                        resolve(response);
                    } else {
                        dispatch(showErrorAlert("Error: Meal Not Updated"));
                        reject(response);
                    }
                } catch (e) {

                    dispatch(showErrorAlert("Error: Meal Not Updated"));
                    reject(e);
                }
            });
        };
    },
    
    DeleteMeal: (mealId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiDelete(`meals/delete/${mealId}`);

                    if (response.success) {
                        dispatch(showSuccessAlert("Meal Deleted Successfully"));
                        resolve(response);
                    } else {
                        dispatch(showErrorAlert("Error: Meal Not Deleted"));
                        reject(response);
                    }
                } catch (e) {

                    dispatch(showErrorAlert("Error: Meal Not Deleted"));
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
