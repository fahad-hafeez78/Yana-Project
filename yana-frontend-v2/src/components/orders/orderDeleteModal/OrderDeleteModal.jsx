import React from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
// import CrossButton from "../../elements/crossButton/CrossButton";

const OrderDeleteModal = ({
  orderDetails,
  onConfirm,
  onCancel
}) => {
  console.log("orderDetails", orderDetails)
  if (!orderDetails) return null; // Guard clause

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
          Delete Order
        </h2>

        <div>
          <h1 className="text-lg font-semibold text-gray-600">
            Order ID: {orderDetails?.order_id}
          </h1>
          <h1 className="text-lg font-semibold text-gray-600">
            Customer: {orderDetails?.customer?.name}
          </h1>
        </div>

        <h3 className="text-gray-400 text-center text-lg font-medium mb-4">
          Are you sure you want to delete this order?
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

export default OrderDeleteModal;
