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

                    const response = await apiPost("participants/create", formData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Participant Created successfully"));
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

    GetAllCustomers: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet("participants/get");
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

    GetAllActiveCustomers: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet("participants/active");

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

    GetCustomersChanges: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet("participantsChanges/get");

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

    GetCustomer: (participantId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet(`participants/get/${participantId}`);


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

    ApproveCustomer: (participantId, ParticipantChanges) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPut(`participantsChanges/approveChanges/${participantId}`, ParticipantChanges);

                    if (response.success) {
                        dispatch(showSuccessAlert("Participant Approved successfully"));
                        resolve(response);
                    } else {
                        // dispatch(LoaderAction.LoaderFalse());
                        reject(response);
                    }
                } catch (e) {
                    dispatch(showErrorAlert("Participant Not Approved "));

                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },


    UpdateCustomer: (participantId, formData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPut(`participants/update/${participantId}`, formData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Participant Updated successfully"));
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

    UpdateCustomerRequest: (requestData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost(`/admin/api/request/action`, requestData);

                    if (response.success) {
                        dispatch(showSuccessAlert("Request Updated successfully"));
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


    GenerateCustomerCredentials: (participantsId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPut(`participants/update/generateCredentials/${participantsId}`);
                    
                    if (response.success) {
                        dispatch(showSuccessAlert("Credentials created successfully"));
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

    ImportCustomersDataFile: (formData) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    // const response = await axiosInstance.post('/navinet/upload', formData);
                    // const receivedAccessToken = response.data.tokens?.accessToken; // Extract received access token
                    // const storedAccessToken = localStorage.getItem('accessToken'); // Retrieve stored access token

                    // // Compare tokens
                    // if (receivedAccessToken && receivedAccessToken !== storedAccessToken) {
                    //     localStorage.setItem('accessToken', receivedAccessToken); // Update local storage
                    //     // update access token in reducx
                    // };

                    const response = await apiPost('Participants/import', formData);

                    if (response.success) {
                        dispatch(showSuccessAlert("File imported successfully"));
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

    // CustomerPendingForm: (participantId, formData) => {
    //     return async (dispatch, getState) => {
    //         return new Promise(async (resolve, reject) => {
    //             try {

    //                 const response = await apiPut(`participants/update/${participantId}`, formData);

    //                 if (response.success) {
    //                     dispatch(showSuccessAlert("Form successfully Submited"));
    //                     resolve(response);
    //                 } else {
    //                     // dispatch(LoaderAction.LoaderFalse());
    //                     reject(response);
    //                 }
    //             } catch (e) {
    //                 // dispatch(LoaderAction.LoaderFalse());
    //                 console.log('Error', e);
    //                 reject(e);
    //             }
    //         });
    //     };
    // },

    GetCustomerRequests: () => {
        return async (dispatch, getState) => {
            try {
                const response = await apiGet("/admin/api/request/");

                if (response.success) {
                    return response;
                } else {
                    throw response; // Instead of reject
                }
            } catch (e) {
                console.error('Error', e);
                throw e; // Propagate the error
            }
        };
    },


};


export default customersMiddleware;
