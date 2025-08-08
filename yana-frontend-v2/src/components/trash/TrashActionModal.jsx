import React from "react";
// import CrossButton from "../../elements/crossButton/CrossButton";
import CrossButton from "../../elements/crossButton/CrossButton";
import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon";

const TrashActionModal = ({
  deleteItemAction,
  onConfirm,
  onCancel
}) => {
  console.log("deleteItemAction", deleteItemAction)
  if (!deleteItemAction) return null; // Guard clause

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[9999]">
      <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray hover:text-gray-dark"
          onClick={onCancel}
        >
          <CrossButton />
        </button>

        <h2 className="text-2xl text-gray text-center font-bold mb-4">
          {deleteItemAction?.actionType === 'restore' ? 'Restore' : 'Delete'}
        </h2>

        <div>
          <h1 className="text-lg font-semibold text-gray-600">
            {deleteItemAction?.actionPage === 'order' ? 'Order' : 'Vendor'} ID: {deleteItemAction?.actionPage === 'order' ? deleteItemAction?.data?.order_id : deleteItemAction?.data?.vendor_id}
          </h1>
          <h1 className="text-lg font-semibold text-gray-600">
            {deleteItemAction?.actionPage === 'order' ? 'Customer Name' : 'Vendor Name'}: {deleteItemAction?.actionPage === 'order' ? deleteItemAction?.data?.customer?.name : deleteItemAction?.data?.name}
          </h1>
        </div>

        <h3 className="text-gray-400 text-center text-lg font-medium mb-4">
          Are you sure you want to {deleteItemAction?.actionType === 'restore' ? 'Restore' : 'delete permanently'}?
        </h3>
        <div className="flex justify-center space-x-4">
          <ButtonWithIcon
            variant="discard"
            onClick={onCancel}
            text="Cancel"
          />
          <ButtonWithIcon
            variant="confirm"
            onClick={onConfirm}
            text="Confirm"
          />

        </div>
      </div>
    </div>
  );
};

export default TrashActionModal;
