import React from 'react';

const ConfirmationDialog = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-md text-center">
        <h3 className="text-lg font-bold mb-4">Generate Credentials</h3>
        <p className="mb-4">Are you sure you want to generate credentials?</p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-[#e6e6e6] hover:bg-[#d5d5d5] text-black px-4 py-2 rounded-full"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-yana-blue hover:bg-[#104964] text-white px-4 py-2 rounded-full"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
