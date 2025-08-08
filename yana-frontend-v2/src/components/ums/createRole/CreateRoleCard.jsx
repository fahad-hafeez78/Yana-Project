import React from "react";
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";

export default function CreateRoleCard({ page, actions, selectedActions, onActionToggle }) {

  const handleToggle = (action) => {
    onActionToggle(page, action);
  };

  const handleModifyPageName = (pageName) => {
    if (pageName === 'participant_changes') {
      return 'Participant Changes'
    }
    else if (pageName === 'participant_requests') {
      return 'Participant Requests'
    }
    else if (pageName === 'TrackingRoute') {
      return 'Tracking Route'
    }
    else if (pageName === 'soft_delete') {
      return 'Soft Delete'
    }
    else
      return capitalizeFirstLetter(pageName)
  };

  const handleModifyActionName = (actionName) => {
    if (actionName === 'orderStarter') {
      return 'Cut Of Period'
    }
    else if (actionName === 'generateCredentials') {
      return 'Generate Credentials'
    }
    else if (actionName === 'menuAssign') {
      return 'Menu Assignment'
    }
    else if (actionName === 'assignRoutes') {
      return 'Send Routes'
    }
    else if (actionName === 'supportReview') {
      return 'Customer Support Review'
    }
    else
      return capitalizeFirstLetter(actionName)

  };

  return (
    <div
      className={`flex flex-col rounded-lg shadow-sm p-2 cursor-pointer border gap-2 ${selectedActions[page]?.length > 0 ? "border-primary border-2" : "border-gray-light"
        }`}
    >
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold truncate">{handleModifyPageName(page)}</h3>
      </div>

      <div className="flex flex-col">
        <label>Permissions</label>
        <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto py-1">
          {actions.map((action) => (
            <span
              key={action}
              onClick={() => handleToggle(action)}
              className={`px-3 py-1 rounded-full text-sm text-center border-2 cursor-pointer ${selectedActions[page]?.includes(action)
                ? "border-primary bg-secondary text-white"
                : ""
                }`}
            >
              {handleModifyActionName(action)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

