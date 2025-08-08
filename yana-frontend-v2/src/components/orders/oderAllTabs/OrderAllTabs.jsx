import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EyeIcon from '../../../assets/customIcons/generalIcons/EyeIcon.svg';
import PhotoIcon from '../../../assets/customIcons/ridersTrackingIcons/PhotoIcon.svg';
import Table from "../../../elements/table/Table";
import statusStyles from "../../../util/statusStyles/StatusStyles";
import usePermissionChecker from "../../../util/permissionChecker/PermissionChecker";
import TrashIcon from "../../../assets/customIcons/generalIcons/trash.svg";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import OrderDeleteModal from "../orderDeleteModal/OrderDeleteModal";
import ordersMiddleware from "../../../redux/middleware/ordersMiddleware";
import { useDispatch } from "react-redux";
import edit from "../../../assets/customIcons/generalIcons/edit.svg"
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";
import moment from "moment";
import { usePaginatedData } from "../../../util/PaginationFilteredData/PaginatedData.jsx";
import ImageModal from "../../../elements/imageModal/ImageModal";

export default function OrderAllTab({
  allOrders,
  isLoading,
  fetchAllOrders,
  tabCurrentStatus,
  setTabCurrentStatus,
  selectedRows,
  setSelectedRows,
  currentPage,
  setCurrentPage,
  itemsPerPage
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checkPermission = usePermissionChecker();
  const isEditPermission = checkPermission('order', 'edit');
  const isDeletePermission = checkPermission('order', 'delete');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrderToDelete, setSelectedOrderToDelete] = useState(null);

  // Use paginated data hook
  const paginatedOrders = usePaginatedData(allOrders, currentPage, itemsPerPage);
  const [displayOrders, setDisplayOrders] = useState(paginatedOrders);


  useEffect(() => {
    setDisplayOrders(paginatedOrders);
  }, [paginatedOrders]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  const columns = [
    { key: 'order_id', header: 'Order Id' },
    { key: 'customer.name', header: 'Participant Name' },
    { key: 'order_units', header: 'Order Units' },
    {
      key: 'OrderPlaceDateTime', header: 'Order Date',
      accessor: (row) => (
        moment(row?.createdAt).format("MM-DD-YYYY")
      )
    },
    ...(tabCurrentStatus === 'completed' ? [
      {
        key: 'pod',
        header: 'POD',
        accessor: (row) => (
          row.pod !== '' ?
            <ImageModal
              imageUrl={row?.pod}
              className="w-7 h-7 rounded object-cover"
            />
            : 'Not provided'
        )
      }
    ] : []),
    { key: 'vendor.name', header: 'Vendor Name' },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => (
        <div className="py-2 flex items-center">
          <StatusBadge status={capitalizeFirstLetter(row?.status)} />
        </div>
      ),
    },
    {
      key: 'Details',
      header: (tabCurrentStatus === "pending" || tabCurrentStatus === "active") ? "Actions" : "Details",
      accessor: (row) => (
        <div className="flex">
          {(tabCurrentStatus === 'pending' || tabCurrentStatus === 'active') ? (
            isEditPermission ?
              <div className="py-1">
                <ButtonWithIcon
                  className="py-2 "
                  icon={<img src={edit} alt="Edit" className="w-5 h-5" />}
                  onClick={() => handleDetailsIconClick(row, true)}
                />
              </div> :
              <ButtonWithIcon
                icon={<img src={EyeIcon} alt="View" className="py-2" />}
                onClick={() => handleDetailsIconClick(row, false)}
              />
          ) : (
            <ButtonWithIcon
              icon={<img src={EyeIcon} alt="View" className="h-5 w-5 hover:scale-110" />}
              onClick={() => handleDetailsIconClick(row, false)}
            />
          )}
          {isDeletePermission &&
            <ButtonWithIcon
              className="text-red hover:text-red-dark"
              icon={<img src={TrashIcon} alt="Delete" className="h-5 w-5 hover:scale-110" />}
              onClick={() => { setSelectedOrderToDelete(row), setIsDeleteModalOpen(true) }}
            />}
        </div>
      ),
    },
  ];

  const StatusBadge = ({ status }) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm border min-w-[100px] text-center ${statusStyles[status] || statusStyles.default}`}>
        {status}
      </span>
    );
  };

  const tabs = [
    { value: null, label: 'All', activeClass: 'text-purple-500' },
    { value: 'active', label: 'Active', activeClass: 'text-green' },
    { value: 'pending', label: 'Pending', activeClass: 'text-yellow-500' },
    { value: 'on the way', label: 'On the way', activeClass: 'text-blue ' },
    { value: 'completed', label: 'Completed', activeClass: 'text-blue-700 ' },
    { value: 'canceled', label: 'Canceled', activeClass: 'text-red-600 ' },
    { value: 'disputed', label: 'Disputed', activeClass: 'text-red ' },
  ];

  const sortOptions = [
    { value: 'oldest', label: 'Sort by: Oldest' },
    { value: 'newest', label: 'Sort by: Newest' },
    { value: 'asc', label: 'Sort by: Cost (Ascend)' },
    { value: 'des', label: 'Sort by: Cost (Descend)' },
  ];

  const handleDetailsIconClick = (orderdata, isEditable) => {
    navigate('/orders/details', { state: { OrderData: orderdata, isEditable } });
  }

  const processedOrders = displayOrders?.map(order => ({
    ...order,
    OrderPlaceDateTime: formatDate(order?.createdAt),
  }));

  const handleSelectAll = () => {
    if (selectedRows.length === processedOrders.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(processedOrders.map(row => row._id));
    }
  };

  const handleSelectRow = (orderId) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(orderId)
        ? prevSelectedRows.filter(id => id !== orderId)
        : [...prevSelectedRows, orderId]
    );
  };

  const handleDeleteConfirm = async (e) => {
    e.preventDefault();
    try {
      setIsDeleteModalOpen(false);
      await dispatch(ordersMiddleware.SoftDeleteOrder(selectedOrderToDelete?._id));
    } catch (error) {
      console.error("Error Deleting Vendor Status:", error);
    } finally {
      setSelectedOrderToDelete(null);
      fetchAllOrders();
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  // Calculate total pages
  const totalPages = Math.ceil(allOrders.length / itemsPerPage);

  return (
    <>
      <Table
        tableTitle="Orders"
        tabs={tabs}
        filterStatus={tabCurrentStatus}
        setFilterStatus={setTabCurrentStatus}
        columns={columns}
        rows={processedOrders}

        searchBarData={paginatedOrders}
        searchBarSetData={setDisplayOrders}

        sortDropdownData={paginatedOrders}
        sortDropdownSetData={setDisplayOrders}
        sortDropdownOptions={sortOptions}

        handleSelectAll={handleSelectAll}
        handleSelectRow={handleSelectRow}

        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={allOrders.length}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isLoading={isLoading}
      />
      {isDeleteModalOpen && (
        <OrderDeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          orderDetails={selectedOrderToDelete}
        />
      )}
    </>
  );
}