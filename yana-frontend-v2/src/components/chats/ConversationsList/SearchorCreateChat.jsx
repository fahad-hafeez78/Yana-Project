import { useEffect, useState } from "react";
import umsMiddleware from "../../../redux/middleware/umsMiddleware";
import SearchBar from "../../../elements/searchBar/SearchBar";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat } from "../../../redux/reducers/userChatsReducer";

export default function SearchorCreateChat({ activeRoleId }) {

    const dispatch = useDispatch();
    const [searchUsers, setsearchUsers] = useState([]);
    const [filteredSearchUsers, setfilteredSearchUsers] = useState([]);
    const { allActiveUsers, allChats } = useSelector(state => state.userChats);
    const { user } = useSelector(state => state.user);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const action = activeRoleId === null
                    ? umsMiddleware.GetAllUsers()
                    : umsMiddleware.GetUsersByRoleId(activeRoleId, 'chat');

                const response = await dispatch(action);
                setsearchUsers(response?.users || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchUsers();
    }, [activeRoleId]);

    const handleSelectNewParticipants = async (selectedUser) => {

        if (selectedUser?.unified_user?._id === user?._id) return
        
        const userChat = allChats.find((chats) => chats?.member?._id === selectedUser?.unified_user?._id) || null;
        console.log("selectedUser", selectedUser)
        console.log("user user", user)

        if (userChat !== null) {
            setfilteredSearchUsers([])
            dispatch(setSelectedChat(userChat));
        }
        else {
            try {
                const NewChatBody = {
                    member: {
                        profile: {
                            name: selectedUser?.name,
                            photo: selectedUser?.photo
                        },
                        _id: selectedUser?.unified_user?._id
                    },
                    _id: ''

                }
                setfilteredSearchUsers([])
                dispatch(setSelectedChat(NewChatBody));

            } catch (error) {
                console.log("Error", error)
            }
        }
    }

    const checkIsUserActive = (user) => {
        const isActive = allActiveUsers.some((activeUser) => activeUser?.userId === user?.unified_user?._id);
        return isActive;
    };

    return (
        <div>
            <div className="p-1">
                <SearchBar
                    Data={searchUsers}
                    setData={setfilteredSearchUsers}
                    searchBarOptions={[{ key: 'name' }]}
                    onSearchChange={setSearchQuery}
                />
            </div>

            {filteredSearchUsers.length > 0 && searchQuery && (
                <ul className="absolute z-10 w-full max-h-40 overflow-y-auto border border-gray-light rounded-md bg-white shadow-lg">
                    {filteredSearchUsers.map((user, index) => (
                        <li
                            key={index}
                            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSelectNewParticipants(user)}
                        >
                            <div className="relative">
                                <img
                                    src={user?.photo || '/MaleAvatar.png'}
                                    alt="Profile Icon"
                                    className="w-10 h-10 rounded-full"
                                />

                                {checkIsUserActive(user) && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-green rounded-full border-2 border-white" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className='px-3 text-gray-dark font-semibold'>{user?.name}</span>
                                <span className='px-3 text-gray-light font-semibold'>Role: {user?.unified_user?.role?.name}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
}
