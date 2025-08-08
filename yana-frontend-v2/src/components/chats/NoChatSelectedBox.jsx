import NoChatSelectedIcon from "../../assets/customIcons/chatsIcons/NoChatSelectedIcon.svg";
export default function NoChatSelectedBox() {

    return (
        <div className="flex flex-col bg-white rounded-2xl w-full max-w-[72%] gap-4 items-center justify-center">

            <img src={NoChatSelectedIcon} height="200px" width="200px" />

            <div className="flex flex-col items-center">
                <label className="text-xl font-bold">
                    No Chat Open
                </label>
                <label className="text-md font-semibold">
                    Select a conversation from the list to start chatting
                </label>
            </div>

        </div>
    )
}