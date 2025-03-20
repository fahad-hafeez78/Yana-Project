import { showSuccessAlert as showSuccess, showErrorAlert as showError, showWarningAlert as showWarning, hideAlert as hideToast } from "../reducers/alertReducer";

export const showSuccessAlert = (message) => {
  return showSuccess(message);
};

export const showErrorAlert = (message) => {
  return showError(message);
};

export const showWarningAlert = (message) => {
  return showWarning(message);
};

export const hideAlert = () => {
  return hideToast();
};
