import React, { useState } from "react";
import CopyIcon from '../../../assets/customIcons/generalIcons/CopyIcon.svg?react'
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";

const ParticipantsCredentialsModal = ({ credentials, onConfirm }) => {
  if (!credentials) return null;

  const [isUsernameCopied, setIsUsernameCopied] = useState(false);
  const [isPasswordCopied, setIsPasswordCopied] = useState(false);

  // Function to handle copying to clipboard
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "username") {
      setIsUsernameCopied(true);
      setTimeout(() => setIsUsernameCopied(false), 2000); // Reset the "copied" state after 2 seconds
    } else {
      setIsPasswordCopied(true);
      setTimeout(() => setIsPasswordCopied(false), 2000); // Reset the "copied" state after 2 seconds
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">
        <h2 className="text-2xl text-gray text-center font-bold mb-4">
          Your One Time Credentials
        </h2>

        <div className="space-y-6 mb-6">
          {/* Username Section */}
          <div>
            <label className="block text-lg font-medium text-gray-dark mb-1">
              Username:
            </label>
            <div className="relative">
              <input
                type="text"
                value={credentials.username}
                disabled
                className="w-full px-4 py-2 border border-gray-light rounded-lg bg-gray-100 text-gray-800 cursor-not-allowed"
              />
              <button
                className="absolute inset-y-0 right-3 flex items-center text-blue-500"
                onClick={() => handleCopy(credentials.username, "username")}
              >
                <CopyIcon />
              </button>
            </div>
            {isUsernameCopied && (
              <p className="text-green text-sm mt-1">Copied to clipboard!</p>
            )}
          </div>

          {/* Password Section */}
          <div>
            <label className="block text-lg font-medium text-gray-dark mb-1">
              Password:
            </label>
            <div className="relative">
              <input
                type="text"
                value={credentials.password}
                disabled
                className="w-full px-4 py-2 border border-gray-light rounded-lg bg-gray-100 text-gray-800 cursor-not-allowed"
              />
              <button
                className="absolute inset-y-0 right-3 flex items-center text-blue-500"
                onClick={() => handleCopy(credentials.password, "password")}
              >
                <CopyIcon />
              </button>
            </div>
            {isPasswordCopied && (
              <p className="text-green text-sm mt-1">Copied to clipboard!</p>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <ButtonWithIcon
            text="Done"
            variant="confirm"
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};

export default ParticipantsCredentialsModal;
