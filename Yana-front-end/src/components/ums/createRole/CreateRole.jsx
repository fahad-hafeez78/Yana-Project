import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import CustomInput from "../../../elements/customInput/CustomInput";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import roleMiddleware from "../../../redux/middleware/roleMiddleware";
import { useDispatch } from "react-redux";

const CreateRole = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [availablePermissions, setAvailablePermissions] = useState([
    "Dashboard", "Orders", "Participants", "Meals", "Menus", "Vendors", "Analytics", "Reviews", "UMS", "PERS"
  ]);

  const [roleData, setRoleData] = useState({
    name: "",
    permissions: [],
  });

  const handlePermissionChange = (permission) => {
    setRoleData((prevData) => {
      const permissions = [...prevData.permissions];
      if (permissions.includes(permission)) {
        return {
          ...prevData,
          permissions: permissions.filter((perm) => perm !== permission),
        };
      } else {
        return {
          ...prevData,
          permissions: [...permissions, permission],
        };
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await dispatch(roleMiddleware.CreateNewRole(roleData));

      if (response?.success) {
        navigate('/ums');
      } else {
        console.error("Error creating role:", response?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md h-[calc(100vh-100px)] relative">
      <h1 className="text-[#959595] mb-[15px] font-bold text-2xl">Create Role</h1>
      <form onSubmit={handleSubmit}>
        
        <div className="mb-4">
          <label htmlFor="name" className="block font-bold mb-[5px]">Role Name <span className='text-red-600'>*</span></label>
          <CustomInput
            id="name"
            name="name"
            value={roleData.name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block font-bold mb-[5px]">Permissions <span className='text-red-600'>*</span></label>

          {/* permissions Grid */}
          <div className="grid grid-cols-2 gap-y-2 mt-2">
            {availablePermissions.map((permission) => (
              <div key={permission} className="flex items-center">
                <input
                  type="checkbox"
                  id={permission}
                  checked={roleData.permissions.includes(permission)}
                  onChange={() => handlePermissionChange(permission)}
                />
                <label htmlFor={permission} className="ml-2">{permission}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
          <ButtonWithIcon
            type="button"
            onClick={handleCancel}
            text="Discard"
            className="bg-red-600 text-white px-3 py-2 rounded-full min-w-[100px]"
          />
          <ButtonWithIcon
            type="submit"
            text="Save"
            className="bg-custom-blue text-white px-3 py-2 rounded-full min-w-[100px]"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateRole;
