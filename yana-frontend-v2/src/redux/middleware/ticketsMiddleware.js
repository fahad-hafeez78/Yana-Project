import { apiGet, apiPatch, apiPost } from "../../config/axiosIntance";
import { showErrorAlert, showSuccessAlert } from "../actions/alertActions";

const ticketsMiddleware = {

    GetAllTickets: (tabCurrentStatus) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet(`v2/admin/ticket/all?status=${tabCurrentStatus}`);

                    if (response?.success) {
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error))
                    reject(error);
                }
            });
        };
    },

    GetTicketMessages: (ticketId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`v2/admin/chat/ticket-messages/${ticketId}`);
                    if (response?.success) {
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error))
                    reject(error);
                }
            });
        };
    },

    UpdateTicket: (ticketId, payload) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPatch(`v2/admin/ticket/${ticketId}`, payload);
                    if (response?.success) {
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
    
}

export default ticketsMiddleware;