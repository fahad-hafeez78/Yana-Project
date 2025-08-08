import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: !!localStorage.getItem('accessToken'),
  token: localStorage.getItem('accessToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
};

const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {

    loginAsync: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('accessToken', action.payload.token);
      // localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },

    logoutAsync: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      localStorage.clear();

    },

    UpdateUserData: (state, action) => {
      localStorage.setItem('user', JSON.stringify(action.payload));
      state.user = action.payload;
    },

  },
});

export const { loginAsync, logoutAsync, UpdateUserData } = userReducer.actions;
export default userReducer.reducer;
