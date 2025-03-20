import React from "react";
import CrossButton from "../../elements/crossButton/CrossButton";

const VendorDeleteModal = ({ 
  vendor,
  onConfirm, 
  onCancel 
}) => {
  if (!vendor) return null; // Guard clause
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">
        
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onCancel}
        >
          <CrossButton />
        </button>

        <h2 className="text-2xl text-gray-500 text-center font-bold mb-4">
          Delete Vendor
        </h2>
        <div className="flex justify-center">
          <img
            src={vendor?.ProfilePhotoPath || 'MaleAvatar.png'}
            alt={vendor.Name}
            className="w-20 h-20 shadow-lg rounded-full mb-1"
          />
        </div>
        <h1 className="text-xl font-bold text-center text-gray-600 mb-2">
          {vendor.Name}
        </h1>
        <h3 className="text-gray-400 text-center text-lg font-medium mb-4">
          Are you sure you want to delete this vendor?
        </h3>
        <div className="flex justify-center space-x-4">
          <button
            className="font-medium px-4 py-2 bg-gray-200 rounded-full text-gray-800 hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="font-medium px-4 py-2 bg-custom-blue text-white rounded-full"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDeleteModal;
