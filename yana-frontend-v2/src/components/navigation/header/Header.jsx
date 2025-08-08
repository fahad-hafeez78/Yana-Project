import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/actions/userAction";
import IconNotification from "../../../assets/customIcons/generalIcons/IconNotification.svg";
import IconChat from "../../../assets/customIcons/chatsIcons/IconChat.svg";
import SearchBar from "../../../elements/searchBar/SearchBar";
import UserProfileModel from "../userProfileModel/UserProfleModel";

function Header() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);
  const { unReadChats } = useSelector((state) => state.userChats);

  const [isModelOpen, setisModelOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleMyProfile = async () => {
    setisModelOpen(false);
    navigate("/myprofile");
  };

  return (
    <div className="flex w-full ">
      <div className="flex-grow">
        <h2 className="text-xl font-semibold text-[#464255]">
          Hello, {user?.admin_user?.name || "Admin"}{" "}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {/* <div className="relative p-2 rounded-[0.9rem] bg-beige">
          <img src={IconNotification} alt="Notification" />
          <span className="absolute -top-3 -right-1 bg-primary text-white text-xs px-1.5 rounded-full border border-white">
            3
          </span>
        </div> */}
        <div className="relative p-2 rounded-xl bg-beige" role="button" onClick={() => navigate('/chats')}>
          <img src={IconChat} alt="Chat" />
          {unReadChats > 0 &&
            <span className="absolute -top-3 -right-1 bg-primary text-white text-xs px-1.5 rounded-full border border-white">
              {unReadChats}
            </span>}
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
  );
}

export default Header;
