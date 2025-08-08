import { useEffect, useRef, useState } from "react";
import FileIcon from "../../../assets/customIcons/chatsIcons/FileIcon.svg";
import ChatEmojiIcon from "../../../assets/customIcons/chatsIcons/ChatEmojiIcon.svg";
import VoiceRecordingIcon from "../../../assets/customIcons/chatsIcons/VoiceRecordingIcon.svg";
import SendChatIcon from "../../../assets/customIcons/chatsIcons/SendChatIcon.svg";
import DiscardVoiceIcon from "../../../assets/customIcons/chatsIcons/DiscardVoiceIcon.svg";
import { emitSocketEvent, offSocketEvent, onSocketEvent } from "../../../config/webSocket";
import { useSelector } from "react-redux";

export default function ChatInputField({
    newMessage,
    setnewMessage,
    handleSendMessage,
    audioBlob,
    setAudioBlob,
    setShowEmojiPicker,
    handleFileChange,
    triggerFileInput,
}) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef();
    const audioChunks = useRef([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const [progress, setProgress] = useState(0);
    const [audioURL, setAudioURL] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);

    const { selectedChat } = useSelector(state => state.userChats);

    const [isOpponentTyping, setIsOpponentTyping] = useState(false);

    useEffect(() => {
        onSocketEvent('typing', () => {
            console.log("typing typing")
            setIsOpponentTyping(true)
        });
        onSocketEvent('stopTyping', () => {
            console.log("stopTyping stopTyping")
            setIsOpponentTyping(false)
        });

        return () => {
            offSocketEvent('typing', {})
            offSocketEvent('stopTyping', {})
        }
    }, []);

    // Message suggestions
    const messageSuggestions = [
        "Hey, How can I help you?",
        "How are you?",
        "Let me check and get back to you",
        "Thanks, Have a good day!",
        "Thanks!"
    ];

    const startRecording = () => {
        setIsRecording(true);
        setRecordingTime(0);
        setProgress(0);
        audioChunks.current = [];
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => {
                audioChunks.current.push(e.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/ogg' });
                setAudioBlob(audioBlob);
                const audioURL = URL.createObjectURL(audioBlob);
                setAudioURL(audioURL);
            };
            mediaRecorderRef.current.start();

            const id = setInterval(() => {
                setRecordingTime((prevTime) => {
                    const newTime = prevTime + 1;
                    setProgress((newTime * 100) / 60);
                    if (newTime >= 60) {
                        clearInterval(id);
                        stopRecording();
                    }
                    return newTime;
                });
            }, 1000);
            setIntervalId(id);
        });
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        } else {
            console.error("Media recorder is not initialized or has already been stopped.");
        }
        if (intervalId) {
            clearInterval(intervalId);
        }
    };

    const discardRecordedAudio = async (e) => {
        setAudioBlob(null);
        setAudioURL(null);
    };

    const handleSuggestionClick = (suggestion) => {
        setnewMessage(suggestion);
        setShowSuggestions(false);
        inputRef.current.focus();
    };

    const handleInputChange = (e) => {
        e.preventDefault();
        if (selectedChat?.member?._id) {
            const body = { "to": selectedChat?.member?._id };
            emitSocketEvent("typing", body);
        }

        setnewMessage(e.target.value);
    };

    const handleInputBlur = (e) => {
        e.preventDefault();
        setTimeout(() => setShowSuggestions(false), 200)
        if (selectedChat?.member?._id) {
            const body = { "to": selectedChat?.member?._id };
            emitSocketEvent("stopTyping", body);
        }
    };

    return (
        <div className="flex flex-col w-full gap-1">
            {/* Suggestions row (appears above input when focused) */}
            {showSuggestions && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
                    {messageSuggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="whitespace-nowrap px-3 py-1 bg-primary-light text-white hover:bg-primary rounded-full text-sm text-gray-dark transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
            {isOpponentTyping && !showSuggestions && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide text-gray-dark">
                    Typing...
                </div>
            )}

            {/* Main input row */}
            <div className="flex w-full gap-1">
                <div className="flex w-full border border-gray-light rounded-lg">
                    {isRecording && (
                        <div className="flex w-full items-center gap-2 py-1 px-5">
                            <div className="w-full bg-gray-light h-2">
                                <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
                            </div>
                            <span>{recordingTime}s</span>
                        </div>
                    )}

                    {!isRecording && audioBlob && (
                        <div className="flex gap-2 items-center w-full pr-5 ">
                            <audio controls src={audioURL} className="w-full h-[32px] p-1" />
                            <button onClick={discardRecordedAudio} className="text-red">
                                <img src={DiscardVoiceIcon} />
                            </button>
                        </div>
                    )}

                    {!isRecording && !audioBlob && (
                        <>
                            <button
                                className="px-2"
                                onClick={() => setShowEmojiPicker((prev) => !prev)}
                            >
                                <img src={ChatEmojiIcon} />
                            </button>
                            <input
                                ref={inputRef}
                                id="title"
                                type="text"
                                name="title"
                                placeholder={"Type a message..."}
                                value={newMessage}
                                onKeyDown={(e) => {
                                    if (e.type === "keydown" && e.key === "Enter") handleSendMessage(e);
                                }}
                                onChange={handleInputChange}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={handleInputBlur}
                                className="w-full py-1 outline-none"
                            />
                            <button className="px-2" onClick={triggerFileInput}>
                                <img src={FileIcon} />
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </button>
                        </>
                    )}
                </div>

                {isRecording ? (
                    <button
                        onClick={stopRecording}
                        className="flex w-10 h-8 bg-secondary-dark rounded-lg justify-center items-center "
                    >
                        <img src={VoiceRecordingIcon} />
                    </button>
                ) : (
                    <>
                        {(!newMessage && !audioBlob) && (
                            <button
                                onClick={startRecording}
                                className="flex w-10 h-8 bg-secondary-dark rounded-lg justify-center items-center"
                            >
                                <img src={VoiceRecordingIcon} />
                            </button>
                        )}
                        {(newMessage || audioBlob) && (
                            <button
                                onClick={handleSendMessage}
                                className="flex w-10 h-8 bg-secondary-dark rounded-lg justify-center items-center"
                            >
                                <img src={SendChatIcon} />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}