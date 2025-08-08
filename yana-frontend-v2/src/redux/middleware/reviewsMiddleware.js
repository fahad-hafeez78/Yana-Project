import { apiGet } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';

const reviewsMiddleware = {
    GetAllReviews: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet("v2/admin/review/customers-list");

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

    GetReviewsByParticipantId: (participantId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet(`v2/admin/review/customer-reviews/${participantId}`);

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


export default reviewsMiddleware;
