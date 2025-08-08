import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProfileCard from "../../../elements/profileCard/ProfileCard";
import moment from "moment";
import BorderTabs from "../../../elements/tabs/BorderTabs";
import { setAllActiveUsers, setAllChats, setSelectedChat } from "../../../redux/reducers/userChatsReducer";
import SearchorCreateChat from "./SearchorCreateChat";
import { emitSocketEvent, getSocket, offSocketEvent, onSocketEvent } from "../../../config/webSocket";
import roleMiddleware from "../../../redux/middleware/roleMiddleware";
import { showErrorAlert } from "../../../redux/actions/alertActions";
import Spinner from "../../../elements/customSpinner/Spinner";

export default function ConversationsList() {
    const dispatch = useDispatch();
    const socket = getSocket();
    const [activeTab, setActiveTab] = useState('all');
    const [roleTabs, setRoleTabs] = useState([
        { value: 'all', roleId: null, label: 'All', activeClass: 'bg-secondary-dark text-white' }
    ]);
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const { user } = useSelector(state => state.user);
    const { selectedChat, allChats, allActiveUsers } = useSelector(state => state.userChats);

    useEffect(() => {
        const fetchAllRoles = async () => {
            try {
                const response = await dispatch(roleMiddleware.GetRolesForCurrentUser('chat'));
                const roleBasedTabs = response?.roles?.map(role => ({
                    value: role.name.toLowerCase(),
                    label: role.name,
                    roleId: role._id,
                    activeClass: 'bg-secondary-dark text-white'
                })) || [];

                setRoleTabs([
                    { value: 'all', roleId: null, label: 'All', activeClass: 'bg-secondary-dark text-white' },
                    ...roleBasedTabs
                ]);
            } catch (error) {
                console.log("Error fetching roles:", error);
            }
        };

        fetchAllRoles();
    }, []);

    useEffect(() => {
        const emitAllChats = () => {
            setIsLoading(true); // Set loading to true when changing tabs
            const body = { role: activeTab };
            emitSocketEvent('allChats', body);
        };

        if (socket) emitAllChats();

        const handleAllChats = (users) => {
            dispatch(setAllChats(users));
            setIsLoading(false); // Set loading to false when data is received
        };

        const handleNewMessage = (message) => {
            if (selectedChat?._id !== message.chat) {
                emitAllChats();
            }
        };

        const handleError = (message) => {
            dispatch(showErrorAlert(message));
            setIsLoading(false); // Set loading to false on error
        };

        onSocketEvent('allChats', handleAllChats);
        onSocketEvent('newMessage', handleNewMessage);
        onSocketEvent('error', handleError);

        return () => {
            offSocketEvent('allChats', handleAllChats);
            offSocketEvent('newMessage', handleNewMessage);
            offSocketEvent('error', handleError);
        };
    }, [socket, activeTab]);

    const handleTabChange = (tabValue) => {
        setActiveTab(tabValue);
        setIsLoading(true); // Set loading immediately when tab changes
    };

    const openChat = (chat) => {
        dispatch(setSelectedChat(chat));
    };

    const getUnreadMessageCount = (unreadMessagesCount) => {
        return unreadMessagesCount === 0 ? "" : unreadMessagesCount;
    };

    const getlastMessage = (chat) => {
        if (!chat?.lastMessage) return "No messages yet";

        const { sender, messageType, text } = chat.lastMessage;
        const isCurrentUser = sender === user?._id;

        switch (messageType) {
            case 'audio': return isCurrentUser ? "You: voice" : "voice";
            case 'document': return isCurrentUser ? "You: document" : "document";
            case 'image': return isCurrentUser ? "You: image" : "image";
            default: return isCurrentUser ? `You: ${text}` : text;
        }
    };

    const getLastMessageTimeStamp = (createdAt) => {
        return createdAt ? moment(createdAt).format('hh:mm A') : "";
    };

    const checkIsUserActive = (chat) => {
        return allActiveUsers.some((user) => user?.userId === chat.member?._id);
    };

    const activeRoleId = roleTabs.find(tab => tab.value === activeTab)?.roleId || null;

    return (
        <div className="flex flex-col h-full">
            {/* Sticky header section */}
            <div className="sticky top-0 z-10 bg-white pb-2">
                <div className="flex flex-col gap-2">
                    <SearchorCreateChat activeRoleId={activeRoleId} />
                    <BorderTabs tabs={roleTabs} activeTab={activeTab} onTabChange={handleTabChange} />
                </div>
            </div>

            {/* Scrollable conversations list */}
            <div className="flex-grow overflow-y-auto">
                {isLoading ? (
                    ''
                        // <Spinner />
                ) : (
                    allChats?.map((chat, index) => (
                        <div
                            key={index}
                            onClick={() => openChat(chat)}
                            className={`cursor-pointer ${chat.unreadMessagesCount > 0 ? 'bg-gray-100' : ''}`}
                        >
                            <ProfileCard
                                primaryText={chat?.member?.profile?.name || ''}
                                unreadmessages={getUnreadMessageCount(chat?.unreadMessagesCount)}
                                secondaryText={getlastMessage(chat)}
                                createdAt={getLastMessageTimeStamp(chat?.lastMessage?.createdAt)}
                                image={chat?.member?.profile?.photo}
                                styles="border-b"
                                isOnline={checkIsUserActive(chat)}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}