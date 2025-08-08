import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCollapsed: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },
    collapseSidebar: (state) => {
      state.isCollapsed = true;
    },
    expandSidebar: (state) => {
      state.isCollapsed = false;
    },
  },
});

export const { toggleSidebar, collapseSidebar, expandSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
