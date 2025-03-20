import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; 
import roleMiddleware from "../../../redux/middleware/roleMiddleware";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import Trash from "../../../assets/trash.svg";
import Edit from "../../../assets/edit.svg";

const ManageRoles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  
  // Adding the missing state for roles
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null); // State for managing selected role

  // Fetch roles function
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await dispatch(roleMiddleware.GetAllRoles());
      setLoading(false);
      
      if (response && response.success) {
        setRoles(response.data); // Update roles state
      } else {
        setError('Failed to load roles');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to load roles');
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [dispatch]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  const handleRoleClick = (role) => {
    // Toggle the selected role: if clicked again, close the details
    setSelectedRole((prevSelectedRole) =>
      prevSelectedRole?._id === role._id ? null : role
    );
  };

const handleEditClick = (role, e) => {
  e.stopPropagation(); // Prevent the role click toggle
  // Navigate to the /edit-role page and pass the role data in the state
  navigate('edit-role', { state: { role } });
};


  const handleDeleteClick = async (role, e) => {
    e.preventDefault();
    try {
      const response = await dispatch(roleMiddleware.DeleteRole(role._id));

      if (response?.success) {
        await fetchRoles();
      } else {
        console.error("Error deleting role:", response?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md h-[calc(100vh-100px)] flex flex-col">
      <h1 className="text-[#959595] mb-[15px] font-bold text-2xl">Manage Roles</h1>

      {/* Container for roles with max height */}
      <div className="overflow-auto max-h-[calc(100vh-270px)]">
        {roles?.length === 0 ? (
          <div className="text-center text-gray-500">No roles available</div>
        ) : (
          <div>
            {roles?.map((role) => (
              <div key={role._id}>
                <div
                  className={`flex justify-between items-center p-2 border-b cursor-pointer ${
                    selectedRole?._id === role._id ? "bg-gray-50 rounded-lg" : ""
                  }`}
                  onClick={() => handleRoleClick(role)} // Toggle details on click
                >
                  <div className="text-lg font-medium">{role.name}</div>
                  
                  {/* Edit and Delete buttons */}
                  <div className="flex gap-2">
                    <button
                      className="bg-transparent p-2 rounded flex items-center justify-center hover:bg-blue-50"
                      onClick={(e) => handleEditClick(role, e)} // Stop propagation and print role
                    >
                      <img src={Edit} alt="Edit" className="h-5 w-5" />
                    </button>
                    <button
                      className="bg-transparent p-2 rounded flex items-center justify-center hover:bg-red-50"
                      onClick={(e) => handleDeleteClick(role, e)} // Stop propagation and print role
                    >
                      <img src={Trash} alt="Delete" className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Display selected role details with expand/collapse */}
                {selectedRole?._id === role._id && (
                  <div className="transition-all duration-300 ease-in-out max-h-96 overflow-auto">
                    <div className="bg-white p-2 rounded-xl mt-3 shadow-lg">
                      <h2 className="text-xl font-semibold mb-2">Role Details</h2>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                        <div className="flex gap-6 mb-4">
                          <p className="text-lg text-red-600">
                            <strong>Name: </strong> <span className="text-black font-light">{role.name}</span>
                          </p>
                          <p className="text-lg text-red-600">
                            <strong>Status: </strong> <span className="text-black font-light">{role.status}</span>
                          </p>
                        </div>

                        <div>
                          <strong className="text-xl text-black">Permissions:</strong>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                            {role.permissions?.map((permission, index) => (
                              <div
                                key={index}
                                className="p-1 transition duration-300 ease-in-out"
                              >
                                <p className="font-light">{permission}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Button Centered */}
      <div className="flex justify-center mt-auto">
        <ButtonWithIcon
          text="Close"
          className="bg-red-600 text-white px-4 py-2 rounded min-w-[100px]"
          onClick={handleClose} // Call handleClose on click
        />
      </div>
    </div>
  );
};

export default ManageRoles;
