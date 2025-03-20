import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  visible: false,
  type: '',
  message: '',
};

const alertSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showSuccessAlert: (state, action) => {
      state.visible = true;
      state.type = 'success';
      state.message = action.payload;
    },
    showErrorAlert: (state, action) => {
      state.visible = true;
      state.type = 'error';
      state.message = action.payload;
    },
    showWarningAlert: (state, action) => {
      state.visible = true;
      state.type = 'warning';
      state.message = action.payload;
    },
    hideAlert: (state) => {
      state.visible = false;
      state.type = '';
      state.message = '';
    },
  },
});

export const { showSuccessAlert, showErrorAlert, showWarningAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;
