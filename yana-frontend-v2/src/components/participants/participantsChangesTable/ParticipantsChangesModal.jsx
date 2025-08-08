import React, { useState } from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import { useDispatch } from "react-redux";
import customersMiddleware from "../../../redux/middleware/customersMiddleware";
import usePermissionChecker from "../../../util/permissionChecker/PermissionChecker";
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";

const ParticipantsChangesModal = ({ customer, onCancel, fetchCustomersChanges }) => {

  if (!customer || !customer.changes) return null;

  const dispatch = useDispatch();

  const checkPermission = usePermissionChecker();
  const isEditPermission = checkPermission('participant_changes', 'edit');

  const changes = customer.changes;
  const changeKeys = Object.keys(changes);

  const [checkedFields, setCheckedFields] = useState({});

  const handleCheckboxChange = (key) => {
    setCheckedFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApproveCustomerChanges = (customerId) => async (e) => {
    e.stopPropagation();
    try {
      const response = await dispatch(customersMiddleware.ApproveCustomerChanges(customerId));
      if (response.success) {
        fetchCustomersChanges()
        onCancel();
      }
    } catch (error) {
      onCancel();
      console.error("Error Approving Customer:", error);
    }
  };

  // Check if all checkboxes are checked
  const allChecked = changeKeys.every((key) => checkedFields[key]);

  // Function to render the change rows
  const renderChangeRows = () => {
    return changeKeys.map((key) => {
      const change = changes[key]; // Get the change object
      const fieldName = change.field; // Get the field name (e.g., "medicaidId", "name")
      const newValue = change.newValue;
      const oldValue = change.previousValue;

      const renderValue = (value) => {
        if (value === null || value === undefined) return 'No Value';
        if (typeof value === "object" && !Array.isArray(value)) {
          return Object.keys(value).map((nestedKey) => (
            <div key={nestedKey}>
              <strong>{nestedKey}:</strong> {value[nestedKey] ?? 'No Value'}
            </div>
          ));
        } else if (Array.isArray(value)) {
          return value.map((item, index) => (
            <div key={index}>{item ?? 'No Value'}</div>
          ));
        } else {
          return value.toString();
        }
      };

      return (
        <div key={key} className="mb-4">
          {/* Title */}
          <div className="text-lg font-semibold text-gray-dark">{capitalizeFirstLetter(fieldName)}</div>

          <div className="flex justify-between items-center">
            <div className="w-1/2 p-2 border-r">
              {renderValue(oldValue)}
            </div>

            <div className="w-1/2 p-2 flex items-start">
              <div className="flex-1">
                {renderValue(newValue)}
              </div>

              {/* Checkbox */}
              <input
                type="checkbox"
                checked={!!checkedFields[key]}
                onChange={() => handleCheckboxChange(key)}
                className="ml-4 mt-2 py-1"
                disabled={!isEditPermission}
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
          className="absolute top-3 right-3 text-gray hover:text-gray-dark"
          onClick={onCancel}
        >
          <CrossButton />
        </button>

        <h2 className="text-2xl text-gray text-center font-bold mb-4">
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
          <ButtonWithIcon
            text="Cancel"
            variant="discard"
            onClick={onCancel}
          />

          {isEditPermission &&
            <ButtonWithIcon
              className={`font-medium px-4 py-1 rounded-full text-white ${allChecked ? "bg-primary" : "bg-gray-dark cursor-not-allowed"
                }`}
              text="Confirm"
              onClick={allChecked ? handleApproveCustomerChanges(customer?.customerId) : undefined}
              disabled={!allChecked}
            />}
        </div>
      </div>
    </div >
  );
};

export default ParticipantsChangesModal;
