import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import CustomInput from "../../../elements/customInput/CustomInput";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import roleMiddleware from "../../../redux/middleware/roleMiddleware";
import { useDispatch, useSelector } from "react-redux";
import CreateRoleCard from './CreateRoleCard';
import { showErrorAlert } from '../../../redux/actions/alertActions';
import Spinner from '../../../elements/customSpinner/Spinner';
import CrossButton from '../../../elements/crossButton/CrossButton';
import umsMiddleware from '../../../redux/middleware/umsMiddleware';
import CustomDropdown from '../../../elements/customDropdown/CustomDropdown';

export default function CreateRole() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const [roles, setRoles] = useState([]);
  const [selectedRoleUsers, setSelectedRoleUsers] = useState([]);

  const [roleData, setRoleData] = useState({
    name: "",
    parentRole: [],
    parentUser: null,
    roleDescription: "",
    rolePermissions: {},
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {

      const response = await dispatch(roleMiddleware.GetAllRoles());
      if (response?.success) {
        const filteredRoles = response?.roles?.filter(role => role?.hierarchyLevel !== 3)
        const options = filteredRoles?.map(role => ({
          value: role._id,
          label: role.name,
          permissions: role?.permissions,
        }));
        setRoles([{ value: "", label: "Select", permissions: [] }, ...options]);
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSelectedRoleUsers = async (parentRole) => {

    const selectedRole = roles.find(role => role?.value === parentRole);
    console.log("selectedRole", selectedRole)
    setRoleData((prevData) => ({
      ...prevData,
      permissions: selectedRole?.permissions,
    }));

    try {
      const response = await dispatch(umsMiddleware.GetUsersByRoleId(parentRole));
      if (response && response.success) {

        const options = response.users?.map((user) => ({
          value: user?.unified_user?._id,
          label: user?.name,
        }))

        setSelectedRoleUsers([{ value: "", label: "Select" }, ...options]);
      }
    } catch (err) {
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "parentRole") {
      console.log("roles", roles)
      const selectedRole = roles.find(role => role.value === value);
      console.log("selectedRole", selectedRole)
      const updatedFields = {
        _id: selectedRole?.value,
        name: selectedRole?.label
      }
      setRoleData((prevData) => ({
        ...prevData,
        [name]: updatedFields,
      }));

      if (value !== "" && value !== "Select") fetchSelectedRoleUsers(value);
    }

    else if (name === "parentUser") {
      const selectedUser = selectedRoleUsers.find(user => user?.value === value);
      const updatedFields = {
        _id: selectedUser?.value,
        name: selectedUser?.label
      }
      setRoleData((prevData) => ({
        ...prevData,
        [name]: updatedFields,
      }));
    }

    else {
      setRoleData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

  };

  const handleActionToggle = (page, action) => {
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

      // Create a new rolePermissions object
      const newRolePermissions = { ...prevData.rolePermissions };

      if (updatedActions.length > 0) {
        newRolePermissions[page] = updatedActions;
      } else {
        delete newRolePermissions[page];
      }

      return {
        ...prevData,
        rolePermissions: newRolePermissions,
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

    if (formattedPermissions.length === 0 ||
      formattedPermissions.every(({ actions }) => actions.length === 0)) {
      dispatch(showErrorAlert("Select at least one permission"));
      return;
    }

    // Prepare the final payload
    const mergingFieldsWithPermissions = {
      name: roleData?.name,
      description: roleData?.roleDescription,
      parentRole: roleData?.parentRole._id,
      parentUser: roleData?.parentUser._id,
      permissions: formattedPermissions,
    };
    setIsLoading(true);
    try {
      const response = await dispatch(roleMiddleware.CreateNewRole(mergingFieldsWithPermissions));
      if (response?.success) {
        navigate("/roles");
      }
    } catch (error) {
      console.error("Error creating role:", error);
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
        <h1 className="text-2xl font-bold">Create Role</h1>
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
            <div className="md:col-span-1">
              <CustomDropdown
                label="Parent Role"
                name="parentRole"
                value={roleData?.parentRole?._id || ""}
                onChange={handleInputChange}
                options={roles}
              />
            </div>
            <div className="md:col-span-1">

              <CustomDropdown
                label="Parent User"
                name="parentUser"
                value={roleData?.parentUser?._id || ""}
                onChange={handleInputChange}
                options={selectedRoleUsers}
              />
            </div>

          </div>

          {/* Permissions Section */}
          <div>
            <label className="block font-semibold mb-2">Select Permissions</label>
            {roleData?.permissions ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleData?.permissions?.map(({ page, actions }) => (
                  <CreateRoleCard
                    key={page}
                    page={page}
                    actions={actions}
                    selectedActions={roleData?.rolePermissions}
                    onActionToggle={handleActionToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-gray">
                  {roleData?.parentRole
                    ? "No permissions available for the selected role"
                    : "Please select a parent role to view available permissions"}
                </p>
              </div>
            )}
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

