import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  visible: false,
  type: '',
  message: '',
  title: '',
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showSuccessAlert: (state, action) => {
      state.visible = true;
      state.type = 'success';
      state.message = action.payload.message;
      state.title = action.payload.title || '';
    },
    showErrorAlert: (state, action) => {
      state.visible = true;
      state.type = 'error';
      state.message = action.payload.message;
      state.title = action.payload.title || '';
    },
    showWarningAlert: (state, action) => {
      state.visible = true;
      state.type = 'warning';
      state.message = action.payload.message;
      state.title = action.payload.title || '';
    },
    showPushNotification: (state, action) => {
      state.visible = true;
      state.type = 'success'; // or determine from payload
      state.message = action.payload.message;
      state.title = action.payload.title;
    },
    hideAlert: (state) => {
      state.visible = false;
      state.type = '';
      state.message = '';
      state.title = '';
    },
  },
});

export const { 
  showSuccessAlert, 
  showErrorAlert, 
  showWarningAlert, 
  hideAlert,
  showPushNotification
} = alertSlice.actions;
export default alertSlice.reducer;