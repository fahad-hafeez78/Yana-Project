import { configureStore } from '@reduxjs/toolkit';

import userReducer from './reducers/userReducer';
import sidebarReducer from './reducers/sidebarReducer';
import alertReducer from './reducers/alertReducer';

export const store = configureStore({
  reducer: {
    alert: alertReducer,
    user: userReducer,
    sidebar: sidebarReducer,
  },
});
