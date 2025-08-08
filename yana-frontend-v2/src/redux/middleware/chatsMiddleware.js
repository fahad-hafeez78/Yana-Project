import { apiGet, apiPost } from "../../config/axiosIntance";
import { showErrorAlert } from "../actions/alertActions";

const chatsMiddleware = {
    CreateNewChat: (chatBody) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPost("/admin/api/chat", chatBody)

                    if (response.success) {
                        resolve(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },
    GetUsersChats: (userId, role) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const url = role
                        ? `/admin/api/chat/${userId}/${role}`
                        : `/admin/api/chat/${userId}`;
                        
                    const response = await apiGet(url);

                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    GetUsersChatsFromIds: (senderId, receiverId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet(`/admin/api/chat/find/${senderId}/${receiverId}`);

                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    SendNewMessage: (message) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost('/admin/api/message', message)

                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    SendRespondToParticipant: (body) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost('/admin/api/chat/respondParticipant', body)

                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },

    GetMessages: (chatId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiGet(`v2/admin/chat/chat-messages/${chatId}`)

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


    clearUnreadMessageCount: (chatId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {

                    const response = await apiPost(`/admin/api/chat/clear-unread-message/${chatId}`)

                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                } catch (e) {
                    console.log('Error', e);
                    reject(e);
                }
            });
        };
    },
}

export default chatsMiddleware;