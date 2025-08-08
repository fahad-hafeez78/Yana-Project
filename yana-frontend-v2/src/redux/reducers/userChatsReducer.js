import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    unReadChats: 0,
    selectedChat: null,
    allChats: [],
    allActiveUsers: []
};

const userChatsReducer = createSlice({
    name: 'userChats',
    initialState,
    reducers: {

        setAllChats: (state, action) => {
            state.allChats = action.payload;
        },

        setUnReadChats: (state, action) => {
            state.unReadChats = action.payload;
        },

        setSelectedChat: (state, action) => {
            state.selectedChat = action.payload;
        },

        setAllActiveUsers: (state, action) => {
            state.allActiveUsers = action.payload;
        },

        clearChats: (state) => {
            state.selectedChat = null;
            state.allChats = [];
        }

    },
});

export const { setAllChats, setSelectedChat, clearChats, setAllActiveUsers, setUnReadChats } = userChatsReducer.actions;
export default userChatsReducer.reducer;
