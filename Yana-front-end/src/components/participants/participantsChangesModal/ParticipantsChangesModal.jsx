import React, { useState } from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import { useDispatch } from "react-redux";
import customersMiddleware from "../../../redux/middleware/customersMiddleware";

const ParticipantsChangesModal = ({ customer, onCancel }) => {
  if (!customer.fields || customer.fields.length === 0) return null;

  const dispatch = useDispatch();
  const changes = customer.fields;

  // State to track checkbox status using field _id
  const [checkedFields, setCheckedFields] = useState({});

  // Update checked status
  const handleCheckboxChange = (field, newValue) => {
    setCheckedFields((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleApproveCustomer = (participantId) => async (e) => {
    e.stopPropagation();
    try {
      const response = await dispatch(customersMiddleware.ApproveCustomer(participantId, checkedFields));
      if (response.success) {
        onCancel();
        // window.location.reload(); // Reload page
      } else {
        console.error("Error Approving Customer");
      }
    } catch (error) {
      console.error("Error Approving Customer:", error);
    }
  };

  // Check if all checkboxes are checked
  const allChecked = changes.every((change) => checkedFields[change.field]);

  const renderChangeRows = () => {
    return changes.map((change) => {
      const { field, newValue, previousValue, _id } = change;

      return (
        <div key={_id} className="mb-4">
          {/* Title */}
          <div className="text-lg font-semibold text-gray-700 mb-2">{field}</div>

          <div className="flex justify-between items-center">
            {/* Previous Value Column */}
            <div className="w-1/2 p-2 border-r">
              <div>{previousValue}</div>
            </div>

            {/* Current Value Column */}
            <div className="w-1/2 p-2 flex items-start">
              <div className="flex-1">
                <div>{newValue}</div>
              </div>

              {/* Checkbox */}
              <input
                type="checkbox"
                checked={!!checkedFields[field]}
                onChange={() => handleCheckboxChange(field, newValue )}
                className="ml-4 mt-2 py-1"
              />
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-[70%] shadow-lg p-4 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onCancel}
        >
          <CrossButton />
        </button>

        <h2 className="text-2xl text-gray-500 text-center font-bold mb-4">
          Customer Changes
        </h2>

        {/* Column Headers */}
        <div className="flex justify-between mb-4">
          <div className="w-1/2 text-center font-bold text-lg border-r">
            Previous
          </div>
          <div className="w-1/2 text-center font-bold text-lg">
            Current
          </div>
        </div>

        {/* Changes Content */}
        <div className="space-y-4 overflow-auto max-h-[calc(100vh-300px)]">
          {renderChangeRows()}
        </div>

        {/* Confirm and Cancel Buttons */}
        <div className="flex justify-center mt-4 gap-2">
          <button
            className="font-medium px-4 py-1 bg-gray-200 rounded-full text-gray-800 hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`font-medium px-4 py-1 rounded-full text-white ${allChecked ? "bg-custom-blue" : "bg-gray-400 cursor-not-allowed"
              }`}
            onClick={allChecked ? handleApproveCustomer(customer?.participantId?._id) : undefined}
            disabled={!allChecked}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsChangesModal;
