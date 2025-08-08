import EmojiPicker from "emoji-picker-react";
import ChatInputField from "../../chats/ChatBox/ChatInputField";
import ImageUploadModal from "../../chats/ImageUploadModal";

export default function ChatInputSection({
    newMessage,
    setNewMessage,
    handleSendMessage,
    audioBlob,
    setAudioBlob,
    setShowEmojiPicker,
    handleFileChange,
    triggerFileInput,
    showSelectedImage,
    imageFile,
    setShowSelectedImage,
    setImageFile,
    showEmojiPicker,
    onEmojiClick,
    isEditPermission
}) {
    return (
        isEditPermission && <div className='flex flex-col items-center relative'>
            <ChatInputField
                newMessage={newMessage}
                setnewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                audioBlob={audioBlob}
                setAudioBlob={setAudioBlob}
                setShowEmojiPicker={setShowEmojiPicker}
                handleFileChange={handleFileChange}
                triggerFileInput={triggerFileInput}
            />
            {showSelectedImage && (
                <ImageUploadModal
                    selectedImage={imageFile}
                    newMessage={newMessage}
                    setnewMessage={setNewMessage}
                    onConfirm={(e) => { setShowSelectedImage(false), handleSendMessage(e) }}
                    onCancel={() => { setShowSelectedImage(false), setImageFile(null) }}
                />
            )}
            {showEmojiPicker && (
                <div className="absolute bottom-[50px] z-50 w-full">
                    <EmojiPicker onEmojiClick={onEmojiClick} height={400} />
                </div>
            )}
        </div>
    )
}