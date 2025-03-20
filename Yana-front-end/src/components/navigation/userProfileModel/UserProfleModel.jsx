import React, { useEffect, useRef } from "react";
import profile from '../../../assets/profile.svg';
import logoutIcon from '../../../assets/logoutIcon.svg';
import { useSelector } from "react-redux";

function UserProfileModel({ isModelOpen, toggleModel, onLogout, onProfile }) {

    const {user}=useSelector((state)=>state.user)
    const modalRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                toggleModel(false);
            }
        };
        if (isModelOpen) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isModelOpen, toggleModel]);

    
    return (
        <div className="relative inline-block" ref={modalRef}>
            <button className="bg-transparent cursor-pointer " onClick={() => toggleModel(!isModelOpen)}>
                <img src={user?.image || 'MaleAvatar.png'} alt="Avatar" className="w-10 h-10 rounded-full " />
            </button>

            {isModelOpen && (
                <div className="absolute right-0 z-10 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-2" role="menu" aria-orientation="vertical">
                        <div className="flex items-center px-2 gap-2">
                            <img
                                src={user.image || 'MaleAvatar.png'}
                                alt="Profile Icon"
                                className="w-8 h-8 rounded-full "
                            />
                            <span className="text-md text-gray-700 block truncate max-w-[20ch]">
                                {user?.name || "Admin"} <br /> {user?.email}
                            </span>
                        </div>
                        <hr className="my-2 border-gray-200" />
                        <button
                            onClick={onProfile}
                            className="flex items-center w-full text-left px-4 py-2 text-md text-gray-700 hover:bg-gray-100 mb-2"
                            role="menuitem"
                        >
                            <img
                                src={profile}
                                alt="Profile Icon"
                                className="w-4 h-4 mr-2"
                            />
                            My Profile
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center w-full text-left px-4 py-2 text-md text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                        >
                            <img src={logoutIcon} alt="Logout Icon" className="w-4 h-4 mr-2" />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfileModel;
