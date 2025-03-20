import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';

import Table from "../../elements/table/Table";
import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon";
import importfile from "../../assets/import file.svg";
import umsMiddleware from "../../redux/middleware/umsMiddleware";

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
];

const RoleBasedAssignment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setisLoading] = useState(true);

  const itemsPerPage = 100;

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await dispatch(umsMiddleware.GetAllUsers());
        setUsers(response?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      finally {
        setisLoading(false); // Hide spinner
      }
    };

    fetchUsers();
  }, [dispatch]);

  // Calculate total pages and current page data
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const displayedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Define button actions
  const buttonData = [
    {
      text: "Add User",
      icon: <img src={importfile} alt="import file" width={18} height={18} />,
      className: "bg-custom-blue text-white px-3 py-2 rounded-full",
      onClick: () => navigate("add-user"),
    },
    {
      text: "Create New Role",
      icon: <img src={importfile} alt="import file" width={18} height={18} />,
      className: "bg-custom-blue text-white px-3 py-2 rounded-full",
      onClick: () => navigate("create-role"),
    },
    {
      text: "Manage Existing Role",
      icon: <img src={importfile} alt="download file" width={18} height={18} />,
      className: "bg-red-600 text-white px-3 py-2 rounded-full",
      onClick: () => navigate("manage-role"),
    },
  ];

  const handleDetailsIconClick = (userdata) => {
    navigate('/ums/edit-user', { state: { UserData: userdata } });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Buttons Section */}
      <div className="flex justify-end items-center">
        <div className="flex gap-3">
          {buttonData.map((button, index) => (
            <ButtonWithIcon
              key={index}
              onClick={button.onClick}
              icon={button.icon}
              text={button.text}
              className={button.className}
            />
          ))}
        </div>
      </div>

      {/* Table Section */}
      <Table
        tableTitle="Role-Based Assignment"

        columns={columns}
        rows={displayedUsers}

        secondlastColumnName="Role"
        lastColumnName="Details"

        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={users.length}

        tableHeight="h-[calc(100vh-290px)]"
        isLoading={isLoading}

      >
        {(user) => (
          <>
            {/* Role Badge */}
            <td className="py-3 flex">
              <span className="px-3 py-1 rounded-full text-sm min-w-[100px] text-center border border-gray-600" >
                {user.Role}
              </span>
            </td>

            {/* Details Button */}
            <td className="py-3 px-5">
              <button onClick={() => handleDetailsIconClick(user)} >
                <img src={EyeIcon} alt="View" width={18} height={18} />
              </button>
            </td>
          </>
        )}
      </Table>
    </div>
  );
};

export default RoleBasedAssignment;
