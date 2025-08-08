// alertActions.js
import { 
  showSuccessAlert as showSuccess, 
  showErrorAlert as showError, 
  showWarningAlert as showWarning, 
  hideAlert as hideToast,
  showPushNotification as showPush
} from "../reducers/alertReducer";

// Unified action creators that support both message and title
export const showSuccessAlert = (message, title = '') => {
  return showSuccess({ message, title });
};

export const showErrorAlert = (message, title = '') => {
  return showError({ message, title });
};

export const showWarningAlert = (message, title = '') => {
  return showWarning({ message, title });
};

export const hideAlert = () => {
  return hideToast();
};

export const showPushNotification = (payload) => {
  return showPush(payload);
};