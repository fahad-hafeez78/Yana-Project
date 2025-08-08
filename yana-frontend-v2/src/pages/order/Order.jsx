import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import ExportOrderIcon from '../../assets/customIcons/ordersIcon/export-orders.svg';
import PlaceOrderIcon from '../../assets/customIcons/ordersIcon/place-order.svg';
import SettingsIcon from '../../assets/customIcons/generalIcons/SettingsIcon.svg';
import OrderAllTab from '../../components/orders/oderAllTabs/OrderAllTabs.jsx';
import { useDispatch } from 'react-redux';
import ordersMiddleware from '../../redux/middleware/ordersMiddleware.js';
import orderStartCutIcon from "../../assets/customIcons/ordersIcon/orderStartCutIcon.svg";
import ExportOrders from '../../components/orders/exportOrders/ExportOrders.jsx';
import vendorsMiddleware from '../../redux/middleware/vendorsMiddleware.js';
import BulkActionsModal from '../../components/orders/bulkActionsModal/BulkActionsModal.jsx';
import { showWarningAlert } from '../../redux/actions/alertActions.js';
import ExportOrderVendorSelection from '../../components/orders/exportOrders/ExportOrderVendorSelection.jsx';
import usePermissionChecker from '../../util/permissionChecker/PermissionChecker.jsx';
import { usePaginationController } from "../../util/PaginationFilteredData/PaginationController.jsx";
import OrderCutOffModal from '../../components/orders/orderCutOffModal/OrderCutOffModal.jsx';

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checkPermission = usePermissionChecker();

  const isCreateOrderPermission = checkPermission('order', 'create');
  const isExportOrderPermission = checkPermission('order', 'export');
  const isCutOffPeriodPermission = checkPermission('order', 'orderStarter');

  // Pagination
  const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

  // Data state
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal and export states
  const [isExportOrders, setIsExportOrders] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isBulkActionsModalOpen, setIsBulkActionsModalOpen] = useState(false);
  const [VendorDishStats, setVendorDishStats] = useState([]);
  const [ordersToExport, setOrdersToExport] = useState([]);

  const [isExportOrderOpen, setIsExportOrderOpen] = useState(false);

  // Tab state with search params
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabCurrentStatus, setTabCurrentStatus] = useState(searchParams.get('tab') || null);

  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const dropdownRef = useRef(null);

  // Handle URL parameters
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== tabCurrentStatus) {
      setTabCurrentStatus(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (tabCurrentStatus) params.tab = tabCurrentStatus;
    if (currentPage !== 1) params.page = currentPage;

    setSearchParams(params);
  }, [tabCurrentStatus, currentPage]);

  // Fetch orders when tab changes
  useEffect(() => {
    fetchAllOrders();
  }, [tabCurrentStatus]);

  const fetchAllOrders = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(ordersMiddleware.GetAllOrders(tabCurrentStatus));
      setAllOrders(response?.orders || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlaceOrderClicking = () => {
    navigate('/orders/placeorder');
  };

  const handleExportOrders = async (vendorId) => {
    setIsLoading(true);
    try {
      const vendorStatsResponse = await dispatch(vendorsMiddleware.GetVendorDishStats(vendorId, tabCurrentStatus || "all"));
      setVendorDishStats(vendorStatsResponse.stats);
      const filtered = allOrders.filter(order => order?.vendor?.vendor_id == vendorStatsResponse.stats?.vendor_details?.vendor_id)
      const sortedOrders = [...filtered].sort((a, b) => a.customer.name.localeCompare(b.customer.name));
      setOrdersToExport(sortedOrders);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setIsExportOrderOpen(false);
      setIsExportOrders(true);
    }
  };

  const onConfirmStatus = async (status) => {
    if (selectedRows?.length === 0) {
      dispatch(showWarningAlert("Select Rows First"))
    } else {
      const bulkChangeBody = {
        ids: selectedRows,
        status: status
      }
      try {
        const response = await dispatch(ordersMiddleware.ChangeStatusInBulk(bulkChangeBody));
        if (response?.success) {
          setIsBulkActionsModalOpen(false)
          setSelectedRows([])
          fetchAllOrders();
        }
      } catch (error) {
        console.log("error", error);
      }
    }
  }

  return (
    <>
      <div className="flex flex-col h-full gap-3">
        <div className="flex gap-3 justify-end items-center">

          <ButtonWithIcon
            onClick={() => setIsBulkActionsModalOpen(true)}
            icon={<img src={SettingsIcon} alt="import file" width={18} height={18} />}
            text="Actions"
            variant='secondary'
          />

          {isCreateOrderPermission &&
            <ButtonWithIcon
              onClick={handlePlaceOrderClicking}
              icon={<img src={PlaceOrderIcon} alt="import file" width={18} height={18} />}
              text="Place Order"
              variant='primary'
            />}

          {isExportOrderPermission &&
            <ButtonWithIcon
              onClick={() => setIsExportOrderOpen(true)}
              icon={<img src={ExportOrderIcon} alt="download file" width={18} height={18} />}
              text="Export Orders"
              variant='primaryDark'
            />}

          {isCutOffPeriodPermission &&
            <div className="relative" ref={dropdownRef}>
              <ButtonWithIcon
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                icon={<img src={orderStartCutIcon} alt="orerStartCutIcon" width={24} height={24} />}
                className="bg-transparent py-2 rounded-full"
              />
              {isDropdownOpen && <OrderCutOffModal setIsDropdownOpen={setIsDropdownOpen} />}
            </div>}

        </div>

        <OrderAllTab
          allOrders={allOrders}
          isLoading={isLoading}
          tabCurrentStatus={tabCurrentStatus}
          setTabCurrentStatus={setTabCurrentStatus}
          fetchAllOrders={fetchAllOrders}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {isExportOrders && (
        <ExportOrders
          allOrders={ordersToExport}
          VendorDishStats={VendorDishStats}
          setIsExportOrders={setIsExportOrders}
          setOrdersToExport={setOrdersToExport}
          setVendorDishStats={setVendorDishStats}
        />
      )}
      {isBulkActionsModalOpen && <BulkActionsModal onCancel={() => setIsBulkActionsModalOpen(false)} onConfirmStatus={onConfirmStatus} />}
      {isExportOrderOpen && <ExportOrderVendorSelection onCancel={() => setIsExportOrderOpen(false)} onConfirm={handleExportOrders} />}
    </>
  );
};

export default Orders;