import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { usePaginationController } from "../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../util/PaginationFilteredData/PaginatedData.jsx";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';
import edit from "../../assets/customIcons/generalIcons/edit.svg";
import TrashIcon from '../../assets/customIcons/generalIcons/trash.svg';
import importfile from "../../assets/customIcons/generalIcons/import file.svg";

import Table from "../../elements/table/Table";
import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon";
import umsMiddleware from "../../redux/middleware/umsMiddleware";
import usePermissionChecker from "../../util/permissionChecker/PermissionChecker";
import UserDeleteModal from "../../components/ums/userDeleteModal/UserDeleteModal";
import capitalizeFirstLetter from "../../util/capitalizeFirstLetter/CapitalizeFirstLetter";

const sortOptions = [
  { value: 'oldest', label: 'Sort by: Oldest' },
  { value: 'newest', label: 'Sort by: Newest' },
];

const tabs = [
  { value: 'all', label: 'All', activeClass: 'text-grey-500' },
  { value: 'active', label: 'Active', activeClass: 'text-green' },
  { value: 'inactive', label: 'Inactive', activeClass: 'text-red' },
];

const Users = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const checkPermission = usePermissionChecker();

  // Permissions
  const isCreatePermission = checkPermission('user', 'create');
  const isEditPermission = checkPermission('user', 'edit');
  const isDeletePermission = checkPermission('user', 'delete');

  // Pagination
  const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

  // Data state
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Tab state with search params
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabCurrentStatus, setTabCurrentStatus] = useState(searchParams.get('tab') || 'all');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== tabCurrentStatus) {
      setTabCurrentStatus(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (tabCurrentStatus !== 'all') params.tab = tabCurrentStatus;
    if (currentPage !== 1) params.page = currentPage;
    
    setSearchParams(params);
  }, [tabCurrentStatus, currentPage]);

  const paginatedUsers = usePaginatedData(users, currentPage, itemsPerPage);
  const [displayUsers, setDisplayUsers] = useState(paginatedUsers);

  const columns = [
    { key: "name", header: "Name" },
    { key: "unified_user.email", header: "Email" },
    {
      key: 'unified_user.role.name',
      header: 'Role',
      accessor: (row) => (
        <div className="py-3 flex">
          <span className="px-3 py-1 rounded-full text-sm min-w-[100px] text-center border border-gray-600" >
            {capitalizeFirstLetter(row?.unified_user?.role?.name)}
          </span>
        </div>
      ),
    },
    { key: "unified_user.createdByName", header: "Created By" },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => (
        <div className="py-3 flex">
          <button
            className={`w-10 h-6 rounded-full transition-colors duration-200 ease-in-out hover:scale-105 ${row?.status === 'active' ? 'bg-primary' : 'bg-gray-200'}`}
            onClick={(e) => handleToggleActive(e, row)}
            disabled={user?.role?.name !== 'admin'}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${row?.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
          </button>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      accessor: (row) => (
        <div className="flex gap-1">
          <button onClick={() => handleDetailsIconClick(row)} >
            <img src={EyeIcon} alt="View" width={18} height={18} />
          </button>

          {isEditPermission && <button onClick={() => handleEditIconClick(row)}>
            <img src={edit} alt="View" width={18} height={18} />
          </button>}
          {isDeletePermission && <button onClick={() => handleDeleteClick(row)}>
            <img src={TrashIcon} alt="View" width={14} height={14} />
          </button>}
        </div>
      ),
    },
  ];

  const handleToggleActive = async (e, row) => {
    e.stopPropagation();
    setIsLoading(true);
    const body = { "status": row?.status === 'active' ? 'inactive' : 'active' }

    try {
      const response = await dispatch(umsMiddleware.UpdateUserStatus(row?.unified_user?._id, body));
      if (response.success) {
        fetchUsers();
      }
    } catch (error) {
      console.log("Error", error)
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsIconClick = (userdata) => {
    navigate('/users/edit-user', { state: { UserData: userdata, isEditable: false } });
  };

  const handleEditIconClick = (userdata) => {
    navigate('/users/edit-user', { state: { UserData: userdata, isEditable: true } });
  };

  const handleDeleteClick = (data) => {
    setSelectedUserToDelete(data);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      const response = await dispatch(umsMiddleware.DeleteAdmin(selectedUserToDelete?.unified_user?._id));
      if (response.success) {
        setIsDeleteModalOpen(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error Deleting Vendor status:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [tabCurrentStatus]);

  useEffect(() => {
    setDisplayUsers(paginatedUsers);
  }, [paginatedUsers]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(umsMiddleware.GetAllUsers(tabCurrentStatus));
      setUsers(response?.users || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Derived values
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Buttons Section */}
      <div className="flex justify-end items-center">
        <div className="flex gap-3">
          {isCreatePermission &&
            <ButtonWithIcon
              onClick={() => navigate("add-user")}
              icon={<img src={importfile} alt="import file" width={18} height={18} />}
              text="Add User"
              variant='primary'
            />}
        </div>
      </div>

      <Table
        tableTitle="Role-Based Assignment"
        columns={columns}
        rows={displayUsers}

        searchBarData={paginatedUsers}
        searchBarSetData={setDisplayUsers}

        tabs={tabs}
        filterStatus={tabCurrentStatus}
        setFilterStatus={setTabCurrentStatus}

        sortDropdownData={paginatedUsers}
        sortDropdownSetData={setDisplayUsers}
        sortDropdownOptions={sortOptions}

        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={users.length}
        isLoading={isLoading}
      />

      {isDeleteModalOpen && (
        <UserDeleteModal
          onConfirm={handleDelete}
          onCancel={handleDeleteCancel}
          userName={selectedUserToDelete?.name}
        />
      )}
    </div>
  );
};

export default Users;