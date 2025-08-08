import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ConversationsList from "../../components/chats/ConversationsList/ConversationsList";
import ChatBox from "../../components/chats/ChatBox/ChatBox";
import { collapseSidebar } from "../../redux/reducers/sidebarReducer";
import NoChatSelectedBox from "../../components/chats/NoChatSelectedBox";
import { clearChats } from "../../redux/reducers/userChatsReducer";

export default function Chats() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selectedChat } = useSelector(state => state.userChats);
    const { user } = useSelector(state => state.user);

    useEffect(() => {

        dispatch(collapseSidebar());

        return () => {
            dispatch(clearChats());
        };
    }, []);

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="flex gap-2 h-full">
            <div className="flex flex-col bg-white rounded-2xl p-2 gap-1 w-[28%]">
                <h2 className="text-2xl text-gray-800 font-bold p-2">Chats</h2>
                <ConversationsList />
            </div>

            {selectedChat?.member ? <ChatBox /> : <NoChatSelectedBox />}
        </div>
    );
}