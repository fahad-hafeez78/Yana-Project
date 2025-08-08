import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ImageUploadModal from "../ImageUploadModal";
import EmojiPicker from 'emoji-picker-react';
import chatsMiddleware from "../../../redux/middleware/chatsMiddleware";
import ProfileCard from "../../../elements/profileCard/ProfileCard";
import OpponentMessage from "./OpponentMessage";
import OwnMessage from "./OwnMessage";
import ChatInputField from "./ChatInputField";
import { emitSocketEvent, offSocketEvent, onSocketEvent } from "../../../config/webSocket";
import { setSelectedChat } from "../../../redux/reducers/userChatsReducer";
import { store } from '../../../redux/store';

export default function ChatBox() {

    const dispatch = useDispatch();

    const { selectedChat, allActiveUsers } = useSelector(state => state.userChats);
    const { user } = useSelector(state => state.user);

    const [messages, setmessages] = useState([]);
    const [newMessage, setnewMessage] = useState('');

    const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [imageFile, setimageFile] = useState();
    const [showSelectedImage, setshowSelectedImage] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);

    const scroll = useRef();

    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedChat?._id) {
                const response = await dispatch(chatsMiddleware.GetMessages(selectedChat._id));
                if (response.success) {
                    setmessages(response.messages);
                }
            }
            else
                setmessages([]);
        };


        fetchMessages();

        if (selectedChat !== null) {
            clearUnreadCounts(selectedChat?._id);
        }

    }, [selectedChat?._id]);

    useEffect(() => {
        scroll?.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {

        const handleNewMessage = (message) => {
            const currentChat = store.getState().userChats.selectedChat;


            if (currentChat?._id === "") {
                const updatedChat = {
                    ...currentChat,
                    _id: message?.chat
                };
                dispatch(setSelectedChat(updatedChat))
                clearUnreadCounts(currentChat?._id);
            }

            else if (currentChat?._id === message?.chat) {
                setmessages(prev => [...prev, message]);
                clearUnreadCounts(currentChat?._id);
            }

        };

        onSocketEvent('newMessage', handleNewMessage)

        return () => {
            offSocketEvent('newMessage', {})
        };
    }, []);

    const clearUnreadCounts = (chatId) => {

        if (chatId) {
            const body = { "chatId": chatId };
            emitSocketEvent("clear-unread-chat-messages-count", body);

            const payload = { "role": 'all' };
            emitSocketEvent('allChats', payload);
        }
    };

    const onEmojiClick = (event) => {
        setnewMessage((prev) => prev + event.emoji);
        setShowEmojiPicker(false);
    };

    const handleFileChange = (e) => {
        e.preventDefault();
        const file = Array.from(e.target.files);
        if (file.length > 0) {
            const imageFile = file[0];
            setimageFile(imageFile);
            setshowSelectedImage(true);
        }
    };

    const triggerFileInput = () => {
        document.getElementById("file-input").click();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage && !imageFile && !audioBlob) return;

        let body;
        if (imageFile) {
            const isImage = imageFile?.type?.includes('image');
            body = {
                "chatId": selectedChat?._id,
                "receiverId": selectedChat?.member._id,
                "text": newMessage,
                "messageType": isImage ? 'image' : 'document',
                "file": imageFile,
                "fileName": imageFile.name,
                "mimeType": imageFile.type
            };
        } else if (audioBlob) {
            body = {
                "chatId": selectedChat?._id,
                "receiverId": selectedChat?.member._id,
                "messageType": 'audio',
                "file": audioBlob,
                "fileName": audioBlob.name,
                "mimeType": audioBlob.type
            };
        } else {
            body = {
                "chatId": selectedChat?._id,
                "receiverId": selectedChat?.member._id,
                "text": newMessage,
                "messageType": 'text',
                "file": null
            };
        }

        emitSocketEvent('sendMessage', body)
        setnewMessage("");
        setimageFile(null);
        setAudioBlob(null);

        // Refresh chat list to update last message and timestamp
        const payload = { "role": 'all' };
        emitSocketEvent('allChats', payload)

    };

    const checkIsUserActive = () => {
        return allActiveUsers.some((user) => user?.userId === selectedChat.member?._id);
    };

    return (
        <div className="flex flex-col bg-white justify-between rounded-2xl py-2 gap-4 w-full">
            <div>
                <div className="flex border-b rounded-2xl p-2 justify-between">
                    <ProfileCard
                        primaryText={selectedChat?.member?.profile?.name}
                        secondaryText={checkIsUserActive() ? 'Online' : 'Away'}
                        image={selectedChat?.member?.profile?.photo}
                    />
                </div>

                <div className="flex flex-col gap-2 p-2 overflow-auto max-h-[calc(100vh-270px)]">
                    {messages?.map((message, index) => (
                        message?.sender !== user?._id ?
                            <OpponentMessage
                                key={index}
                                message={message}
                                userPhoto={selectedChat?.member?.profile?.photo}
                                scroll={scroll}
                                currentlyPlayingAudio={currentlyPlayingAudio}
                                setCurrentlyPlayingAudio={setCurrentlyPlayingAudio}
                            />
                            :
                            <OwnMessage
                                key={index}
                                message={message}
                                userPhoto={user?.admin_user?.photo}
                                scroll={scroll}
                                currentlyPlayingAudio={currentlyPlayingAudio}
                                setCurrentlyPlayingAudio={setCurrentlyPlayingAudio}
                            />
                    ))}
                    <div ref={scroll} />
                </div>
            </div>

            <div className="flex flex-col items-center p-2 relative">
                <ChatInputField
                    newMessage={newMessage}
                    setnewMessage={setnewMessage}
                    handleSendMessage={handleSendMessage}
                    audioBlob={audioBlob}
                    setAudioBlob={setAudioBlob}
                    setShowEmojiPicker={setShowEmojiPicker}
                    handleFileChange={handleFileChange}
                    triggerFileInput={triggerFileInput}
                />

                {showEmojiPicker && (
                    <div className="absolute bottom-[50px] z-50 w-full">
                        <EmojiPicker onEmojiClick={onEmojiClick} height={400} />
                    </div>
                )}
                {showSelectedImage && (
                    <ImageUploadModal
                        selectedImage={imageFile}
                        newMessage={newMessage}
                        setnewMessage={setnewMessage}
                        onConfirm={(e) => { setshowSelectedImage(false), handleSendMessage(e) }}
                        onCancel={() => { setshowSelectedImage(false), setimageFile(null) }}
                    />
                )}
            </div>
        </div>
    );
}