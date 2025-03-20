import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/actions/userAction";
import IconNotification from "../../../assets/customIcons/IconNotification.svg";
import IconChat from "../../../assets/customIcons/IconChat.svg";
import SearchBar from "../../../elements/searchBar/SearchBar";
import UserProfileModel from "../userProfileModel/UserProfleModel";

function Header() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModelOpen, setisModelOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleMyProfile = async () => {
    setisModelOpen(false);
    navigate("/myprofile");
  };

  return (
    <div className="flex flex-col justify-between items-center gap-2">
      <div className="flex w-full justify-between items-center">
        <div className="flex-grow transition-all duration-300 ease-in-out ">
          <h2 className="text-xl font-semibold text-[#464255]">
            Hello, {user?.name || "Admin"}{" "}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative p-2 rounded-[0.9rem] bg-[rgba(45,156,219,0.15)]">
            <img src={IconNotification} alt="Notification" />
            <span className="absolute -top-3 -right-1 bg-[#0E6D99] text-white text-xs px-1.5 rounded-full border border-white">
              3
            </span>
          </div>
          <div className="relative p-2 rounded-[0.9rem] bg-[rgba(45,156,219,0.15)]">
            <img src={IconChat} alt="Chat" />
            <span className="absolute -top-3 -right-1 bg-[#0E6D99] text-white text-xs px-1.5 rounded-full border border-white">
              3
            </span>
          </div>
          <div className="flex justify-center items-center gap-2.5">
            <UserProfileModel
              isModelOpen={isModelOpen}
              toggleModel={setisModelOpen}
              onLogout={handleLogout}
              onProfile={handleMyProfile}
            />
          </div>
        </div>
      </div>
      {/* <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-50"></div> */}

      {/* <div className="w-full h-[1px] bg-gradient-to-r from-main via-transparent to-custom-blue opacity-50"></div> */}
    </div>
  );
}

export default Header;
