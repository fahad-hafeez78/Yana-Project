import ImageModal from "../imageModal/ImageModal";

export default function ProfileCard({ primaryText, secondaryText, createdAt, image, styles, onClick, isOnline, unreadmessages }) {

    return (
        <button className={`flex gap-2 w-full rounded-lg ${styles && "hover:bg-gray-100"}`} onClick={onClick}>

            <div className="relative">
                {/* Profile image */}
                <ImageModal
                    imageUrl={image || '/MaleAvatar.png'}
                    imageText={primaryText}
                    className="w-10 h-10 rounded-full"
                />
                {/* Online status indicator */}
                {isOnline && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green rounded-full border-2 border-white" />
                )}
            </div>

            <div className={`flex flex-col items-start text-gray-dark truncate w-full ${styles}`}>

                <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-semibold max-w-[20ch]">
                        {primaryText}
                    </span>
                    <span className="text-sm text-gray-400">
                        {createdAt}
                    </span>
                </div>
                <div className="flex justify-between items-center w-full">

                    <span className="text-sm text-gray-400 truncate max-w-[20ch]">
                        {secondaryText}
                    </span>


                    {unreadmessages && (
                        <div className="relative">
                            <span className="absolute -top-3 right-2 bg-primary text-white text-xs px-1.5 rounded-full border border-white">
                                {unreadmessages}
                            </span>
                        </div>
                    )}
                </div>

            </div>

        </button>


    )
}