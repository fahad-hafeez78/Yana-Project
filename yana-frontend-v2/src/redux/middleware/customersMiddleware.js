import { apiGet, apiPost, apiPut } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';
// import Axios from 'axios';
// const baseURL = import.meta.env.VITE_BASE_URL;  

// const axiosInstance = Axios.create({
//     baseURL
//   });

const customersMiddleware = {
    CreateCustomer: (formData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost("v2/admin/customer", formData);

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

    GetAllCustomers: (tabCurrentStatus) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet(`v2/admin/customer?status=${tabCurrentStatus}`);

                    if (response.success) {
                        // dispatch(showSuccessAlert(response?.message))
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error))
                    reject(error);
                }
            });
        };
    },

    GetCustomersChanges: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet("v2/admin/customer/all-pending-changes");

                    if (response?.success) {
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    GetCustomer: (CustomerID) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet(`/admin/api/customers/${CustomerID}`);


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

    ApproveCustomerChanges: (customerId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost(`v2/admin/customer/pending-changes/${customerId}`);

                    if (response.success) {
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


    UpdateCustomer: (cutomerId, formData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPut(`v2/admin/customer/${cutomerId}`, formData);
                    if (response.success) {
                        dispatch(showSuccessAlert("Participant Updated successfully"));
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    UpdateCustomerRequest: (requestData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost("v2/admin/customer/request-action", requestData);

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


    GenerateCustomerCredentials: (potentialCustomerBody) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost("v2/admin/customer/generate-credentials", potentialCustomerBody);


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

    ImportCustomersDataFile: (formData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost('v2/admin/customer/import', formData);

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

    CustomerPendingForm: (formData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPut(`/admin/api/formintake/updatealldata/${formData.PotentialCustomerID}`, formData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Form successfully Submited"));
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

    GetCustomerRequests: (status = "all") => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`v2/admin/customer/all-requests?status=${status}`);

                    if (response?.success) {
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


export default customersMiddleware;
