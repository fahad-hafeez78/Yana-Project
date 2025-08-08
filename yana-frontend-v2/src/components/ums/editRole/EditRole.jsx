import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import CustomInput from "../../../elements/customInput/CustomInput";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import roleMiddleware from "../../../redux/middleware/roleMiddleware";
import CreateRoleCard from "../createRole/CreateRoleCard";
import Spinner from "../../../elements/customSpinner/Spinner";
import CrossButton from "../../../elements/crossButton/CrossButton";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";

export default function EditRole() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const role = location.state?.role;
  const [isLoading, setIsLoading] = useState(false);

  const formattedPermissions = role?.permissions?.reduce((acc, perm) => {
    acc[perm.page] = perm.actions;
    return acc;
  }, {});

  const [roleData, setRoleData] = useState({
    name: role?.name || "",
    parentRole: role?.parentRole || null,
    parentUser: role?.parentUser || null,
    roleDescription: role?.description || "",
    rolePermissions: formattedPermissions || {},
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePermission = (page, action) => {

    setRoleData((prevData) => {
      const selected = prevData.rolePermissions[page] || [];
      let updatedActions = [...selected];

      if (action === 'view') {
        if (selected.includes('view')) {
          // When deselecting view, remove all actions for this page
          updatedActions = [];
        } else {
          // When selecting view, just add it
          updatedActions = [...selected, 'view'];
        }
      } else {
        // For non-view actions
        if (selected.includes(action)) {
          // Remove the action
          updatedActions = selected.filter(a => a !== action);
        } else {
          // Add the action and ensure view is included
          updatedActions = [...selected, action];
          if (!selected.includes('view')) {
            updatedActions.push('view');
          }
        }
      }

      // Create a new permissions object
      const newPermissions = { ...prevData.rolePermissions };

      if (updatedActions.length > 0) {
        newPermissions[page] = updatedActions;
      } else {
        // If no actions left, remove the page entirely
        delete newPermissions[page];
      }

      return {
        ...prevData,
        rolePermissions: newPermissions,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedPermissions = Object.entries(roleData.rolePermissions).map(
      ([page, actions]) => ({
        page,
        actions,
      })
    );

    const updatedRole = {
      name: roleData?.name,
      description: roleData?.roleDescription,
      parentRole: roleData?.parentRole?._id,
      parentUser: roleData?.parentUser?.parentUserId,
      permissions: formattedPermissions,
    };

    setIsLoading(true);
    try {
      const response = await dispatch(roleMiddleware.UpdateRole(role?._id, updatedRole));
      if (response?.success) {
        navigate("/roles");
      } else {
        console.error("Error updating role:", response?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  if (isLoading) {
    return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
  }

  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Role</h1>
        <CrossButton onClick={handleCancel} className="text-gray hover:text-gray-dark" />
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col flex-grow min-h-0">
        {/* Scrollable content area */}
        <div className="flex-grow overflow-y-auto px-2 space-y-4">
          {/* Role Name and Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-4">
            <CustomInput
              label="Name"
              name="name"
              value={roleData.name}
              placeholder="Enter Role Name"
              onChange={handleInputChange}
              validationKey="alphanumeric"
              required
            />
            <CustomInput
              label="Description"
              name="roleDescription"
              placeholder="Write a short description"
              value={roleData.roleDescription}
              required
              maxLength={255}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-4">

            <CustomDropdown
              label="Parent Role"
              name="parentRole"
              value={roleData?.parentRole?._id || ""}
              onChange={handleInputChange}
              disabled
              options={[{ value: roleData?.parentRole?._id, label: roleData?.parentRole?.name },]}
            />
            <CustomDropdown
              label="Parent User"
              name="parentUser"
              value={roleData.parentUser?.parentUserId || ""}
              onChange={handleInputChange}
              disabled
              options={[{ value: roleData.parentUser?.parentUserId, label: roleData?.parentUser?.name },]}
            />
          </div>

          {/* Permissions Section */}
          <div>
            <label className="block font-semibold mb-2">Select Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {role?.parentRole?.permissions.map(({ page, actions }) => (
                <CreateRoleCard
                  key={page}
                  page={page}
                  actions={actions}
                  selectedActions={roleData.rolePermissions}
                  onActionToggle={togglePermission}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sticky footer with action buttons */}
        <div className="sticky bottom-0 bg-white pt-4">
          <div className="flex justify-center gap-4 py-2">
            <ButtonWithIcon
              type="button"
              onClick={handleCancel}
              text="Discard"
              variant="discard"
            />
            <ButtonWithIcon
              type="submit"
              text="Save"
              variant="confirm"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
