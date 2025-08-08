import React, { useEffect, useRef } from "react";
import profile from '../../../assets/customIcons/generalIcons/profile.svg';
import logoutIcon from '../../../assets/customIcons/generalIcons/logoutIcon.svg';
import { useSelector } from "react-redux";
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";
import ImageModal from "../../../elements/imageModal/ImageModal";

function UserProfileModel({ isModelOpen, toggleModel, onLogout, onProfile }) {

    const { user } = useSelector((state) => state.user)
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
            <button className="flex bg-transparent cursor-pointer items-center" onClick={() => toggleModel(!isModelOpen)}>
                <img src={user?.admin_user?.photo || '/MaleAvatar.png'} alt="Avatar" className="w-11 h-11 rounded-full" />
            </button>

            {isModelOpen && (
                <div className="absolute right-0 z-50 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-2" role="menu" aria-orientation="vertical">
                        <div className="flex items-center px-2 gap-2">
                            <ImageModal
                                imageUrl={user?.admin_user?.photo || '/MaleAvatar.png'}
                                className="w-10 h-10 rounded-full"
                            />
                            <span className="text-md text-gray-dark block truncate max-w-[20ch]">
                                <p>
                                    <span>{user?.admin_user?.name || "Admin"}</span>
                                    <span className="text-sm text-gray font-semibold">
                                        {' (' + capitalizeFirstLetter(user?.role?.name) + ')'}
                                    </span>
                                </p>
                                {user?.email}
                            </span>

                        </div>
                        <hr className="my-2 border-gray-200" />
                        <button
                            onClick={onProfile}
                            className="flex items-center w-full text-left px-4 py-2 text-md text-gray-dark hover:bg-gray-100 mb-2"
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
                            className="flex items-center w-full text-left px-4 py-2 text-md text-gray-dark hover:bg-gray-100"
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
