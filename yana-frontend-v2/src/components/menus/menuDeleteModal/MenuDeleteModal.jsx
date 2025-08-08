import React from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";

const VendorDeleteModal = ({
  menu,
  onConfirm,
  onCancel
}) => {
  if (!menu) return null; // Guard clause

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray hover:text-gray-dark"
          onClick={onCancel}
        >
          <CrossButton />
        </button>

        <h2 className="text-2xl text-gray text-center font-bold mb-4">
          Delete Menu
        </h2>
        <div className="flex justify-center">
          <img
            src={menu.imgPath}
            alt={menu.name}
            className="w-20 h-20 shadow-lg rounded-full mb-1"
          />
        </div>
        <h1 className="text-xl font-bold text-center text-gray-600 mb-2">
          {menu.name}
        </h1>
        <h3 className="text-gray-400 text-center text-lg font-medium mb-4">
          Are you sure you want to delete this menu?
        </h3>
        <div className="flex justify-center space-x-4">
          <ButtonWithIcon
            text="Cancel"
            variant="discard"
            onClick={onCancel}
          />

          <ButtonWithIcon
            text="Delete"
            variant="confirm"
            onClick={onConfirm}
          />
            
        </div>
      </div>
    </div>
  );
};

export default VendorDeleteModal;
