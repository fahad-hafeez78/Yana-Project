import moment from "moment";
import CreateTaskIcon from "../../../assets/customIcons/chatsIcons/CreateTaskIcon.svg";
import { useRef } from "react";
import ImageModal from "../../../elements/imageModal/ImageModal";

export default function OwnMessage({
    message,
    userPhoto,
    scroll,
    currentlyPlayingAudio,
    setCurrentlyPlayingAudio
}) {

    const audioRef = useRef(null);

    const handleAudioPlay = () => {
        if (currentlyPlayingAudio && currentlyPlayingAudio !== audioRef.current) {
            currentlyPlayingAudio.pause();
        }

        setCurrentlyPlayingAudio(audioRef.current);
    };

    const renderMessageContent = () => {
        switch (message?.messageType) {
            case 'text':
                return (
                    <>
                        <span>{message?.text}</span>
                        <br />
                    </>
                );

            case 'image':
                return (
                    <div className="my-1">
                        <ImageModal
                            imageUrl={message?.mediaUrl || message?.fileUrl}
                            className="max-w-full max-h-40 rounded-md"
                        />
                        {message?.text && (
                            <div className="mt-2">
                                {message.text}
                                <br />
                            </div>
                        )}
                    </div>
                );

            case 'document':
                return (
                    <div className="flex flex-col p-2 bg-red-50 rounded-md my-1">

                        <a
                            href={message?.mediaUrl}
                            download
                            className="m-1 font-semibold text-blue-500 hover:underline"
                        >
                            Download Doc
                        </a>
                        <span className="m-1 text-black ">{message?.text}</span>
                    </div>
                );

            case 'audio':
                return (
                    <>
                        <audio
                            ref={audioRef}
                            controls
                            src={message?.mediaUrl}
                            className="max-w-full my-1"
                            onPlay={handleAudioPlay}
                        />
                        {message?.text}
                    </>
                );

            default:
                return (
                    <>
                        {message?.text && <span>{message.text}<br /></span>}
                        {message?.mediaUrl && <img src={message.mediaUrl} width={200} />}
                        {message?.audio && <audio controls src={message.audio} className="max-w-full" />}
                    </>
                );
        }
    };

    return (
        <div className="flex gap-4 items-end justify-end" key={message._id}>
            {/* <button className="hover:bg-gray-100 p-1 rounded-full">
                <img src={CreateTaskIcon} alt="Create task" />
            </button> */}

            <div className="relative text-white bg-secondary-dark px-3 py-1 rounded-lg text-sm max-w-[40%] break-words">
                {renderMessageContent()}
                <span className="text-xs">{moment(message?.createdAt).format('hh:mm A')}</span>
                <div className="absolute -right-3 bottom-0 w-4 h-0 border-t-[12px] border-t-transparent border-l-[18px] border-l-secondary-dark"></div>
            </div>

            <div ref={scroll} />
        </div>
    );
}