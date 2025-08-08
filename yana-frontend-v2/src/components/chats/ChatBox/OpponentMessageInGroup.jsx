// import moment from "moment";
// import CreateTaskIcon from "../../../assets/customIcons/chatsIcons/CreateTaskIcon.svg";
// import RespondToChatIcon from "../../../assets/customIcons/chatsIcons/RespondToChatIcon.svg";
// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import umsMiddleware from "../../../redux/middleware/umsMiddleware";
// import customersMiddleware from "../../../redux/middleware/customersMiddleware";

// export default function OpponentMessageInGroup({ message, scroll, setselectedMessageForResponse }) {

//     const dispatch = useDispatch();
//     const { selectedChat } = useSelector(state => state.userChats);
//     const { user } = useSelector(state => state.user);
//     const [userDetails, setuserDetails] = useState(null);

//     useEffect(() => {
//         const member = selectedChat?.members?.find((member) => member.userId !== user._id && member.userId === message.senderId);
//         const getUserData = async () => {
//             try {
//                 if (member.role === 'Admin') {
//                     const response = await dispatch(umsMiddleware.GetUserById(member.userId));
//                     if (response.success) {
//                         setuserDetails(response?.data);
//                     }
//                 }
//                 else if (member.role === "Participant") {
//                     const response = await dispatch(customersMiddleware.GetCustomer(member.userId));
//                     if (response.success) {
//                         setuserDetails(response?.data);
//                     }
//                 }

//             } catch (error) {
//                 console.log(error);
//             }
//         };

//         if (selectedChat !== null && selectedChat?.isGroupChat) getUserData();
//     }, [])

//     return (
//         <div className="flex gap-2 items-end" >

//             <img src={userDetails?.ProfilePhotoPath || 'MaleAvatar.png'} alt="Profile Icon" className="w-10 h-10 rounded-full" />

//                 <div className="relative bg-gray-200 px-3 py-1 rounded-lg text-sm max-w-[calc(50%)] break-words">

//                     {message?.audio && <audio controls src={message?.audio} className="max-w-[calc(100%)]" />}
//                     {message?.image && <img src={message?.image} width={200} />}
//                     {message?.text && <span>{message?.text}<br /></span>}

//                     <span className="text-xs">{moment(message?.createdAt).format('hh:mm A')}</span>
//                     <div className="absolute -left-3 bottom-0 w-4 h-0 border-t-[12px] border-t-transparent border-r-[18px] "/>
//                 </div>
                

//             <button>
//                 <img src={CreateTaskIcon} />
//             </button>
//             {!message?.isResponded && (
//                 <button onClick={() => setselectedMessageForResponse(message)}>
//                     <img src={RespondToChatIcon} />
//                 </button>
//             )}
//             <div ref={scroll}></div>
//         </div>
//     );
// }
