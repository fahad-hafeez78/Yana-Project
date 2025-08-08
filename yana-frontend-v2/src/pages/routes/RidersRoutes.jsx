import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { usePaginationController } from "../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../util/PaginationFilteredData/PaginatedData.jsx";
import Table from "../../elements/table/Table";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import statusStyles from "../../util/statusStyles/StatusStyles.js";
import usePermissionChecker from "../../util/permissionChecker/PermissionChecker.jsx";
import capitalizeFirstLetter from "../../util/capitalizeFirstLetter/CapitalizeFirstLetter.js";
import VendorSelectionModal from "../../components/routes/VendorSelectionModal.jsx";
import moment from "moment";
import routesMiddleware from "../../redux/middleware/ridersTracking/routesMiddleware";

const tabs = [
    { value: 'all', label: 'All', activeClass: 'text-gray-800' },
    { value: 'pending', label: 'Pending', activeClass: 'text-yellow-600' },
    { value: 'assigned', label: 'Assigned', activeClass: 'text-blue-500' },
    { value: 'inprogress', label: 'In Progress', activeClass: 'text-purple-800' },
    { value: 'pause', label: 'Paused', activeClass: 'text-orange-800' },
    { value: 'completed', label: 'Completed', activeClass: 'text-green-dark' },
];

const sortOptions = [
    { value: 'oldest', label: 'Sort by: Oldest' },
    { value: 'newest', label: 'Sort by: Newest' },
];

export default function RidersRoutes() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [routes, setRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [isGenerateRouteModalOpen, setIsGenerateRouteModalOpen] = useState(false);
    const [isSendRouteModalOpen, setIsSendRouteModalOpen] = useState(false);
    const [isDeleteRouteModalOpen, setIsDeleteRouteModalOpen] = useState(false);

    // Tab state with search params
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabCurrentStatus, setTabCurrentStatus] = useState(searchParams.get('tab') || 'all');

    // Permissions
    const checkPermission = usePermissionChecker();
    const isCreatePermission = checkPermission('route', 'create');
    const isAssignRoutesPermission = checkPermission('route', 'assignRoutes');
    const isRoutesDeletePermission = checkPermission('route', 'delete');

    // Paginated data
    const paginatedRoutes = usePaginatedData(routes, currentPage, itemsPerPage);
    const [displayRoutes, setDisplayRoutes] = useState(paginatedRoutes);

    const columns = [
        { key: 'rider.name', header: 'Rider' },
        {
            key: 'directions.distance',
            header: 'Distance',
            accessor: (row) => (row?.directions.distance + ' miles')
        },
        {
            key: 'directions.duration',
            header: 'Time',
            accessor: (row) => (row?.directions?.duration?.hours + 'h' + ' - ' + row?.directions?.duration?.minutes + 'min')
        },
        {
            key: 'stops',
            header: 'No of stops',
            accessor: (row) => (row?.stops?.length)
        },
        { key: 'vendorId.name', header: 'Vendor' },
        {
            key: 'createdAt',
            header: 'Created Date',
            accessor: (row) => moment(row?.createdAt).format("MM-DD-YYYY")
        },
        {
            key: 'status',
            header: 'Status',
            accessor: (row) => (
                <span className={`px-3 py-1 rounded-full text-sm border min-w-[100px] text-center ${statusStyles[row?.status] || statusStyles.Default}`}>
                    {capitalizeFirstLetter(row?.status)}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            accessor: (row) => (
                <div className="flex py-3 gap-1">
                    <button onClick={() => navigate('/routes/route-detail', { state: { routeId: row?._id } })}>
                        <img src={EyeIcon} alt="View" width={18} height={18} />
                    </button>
                </div>
            )
        },
    ];

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

    useEffect(() => {
        fetchRoutes();
    }, [tabCurrentStatus]);

    useEffect(() => {
        setDisplayRoutes(paginatedRoutes);
    }, [paginatedRoutes]);

    const fetchRoutes = async () => {
        try {
            setIsLoading(true);
            const body = {
                "status": tabCurrentStatus
            };
            const response = await dispatch(routesMiddleware.GetAllRoutes(body));
            if (response?.success) {
                setRoutes(response?.routes || []);
            }
        } catch (error) {
            console.error("Error fetching routes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateRoutes = async (vendorId) => {
        try {
            setIsLoading(true);
            const response = await dispatch(routesMiddleware.GenerateRoutes(vendorId));
            if (response?.success) {
                fetchRoutes();
            }
        } catch (error) {
            console.error("Error generating routes:", error);
        } finally {
            setIsLoading(false);
            setIsGenerateRouteModalOpen(false);
        }
    };

    const sendRoutesToRider = async (vendorId) => {
        try {
            setIsLoading(true);
            const response = await dispatch(routesMiddleware.SendRoutesToRider(vendorId));
            if (response?.success) {
                fetchRoutes();
            }
        } catch (error) {
            console.error("Error sending routes:", error);
        } finally {
            setIsLoading(false);
            setIsSendRouteModalOpen(false);
        }
    };

    const deleteRoutesForSelectedVendor = async (vendorId) => {
        try {
            setIsLoading(true);
            const response = await dispatch(routesMiddleware.DeleteRoutesForVendor(vendorId));
            if (response?.success) {
                fetchRoutes();
            }
        } catch (error) {
            console.error("Error deleting routes:", error);
        } finally {
            setIsLoading(false);
            setIsDeleteRouteModalOpen(false);
        }
    };

    const handleAssignRoutes = () => {
        setIsSendRouteModalOpen(true);
        setIsGenerateRouteModalOpen(false);
        setIsDeleteRouteModalOpen(false);
    };

    const handleGenerateRoutes = () => {
        setIsGenerateRouteModalOpen(true);
        setIsSendRouteModalOpen(false);
        setIsDeleteRouteModalOpen(false);
    };

    const handleDeleteRoutes = () => {
        setIsDeleteRouteModalOpen(true);
        setIsGenerateRouteModalOpen(false);
        setIsSendRouteModalOpen(false);
    };

    // Derived values
    const totalPages = Math.ceil(routes.length / itemsPerPage);

    return (
        <div className="flex flex-col h-full gap-5">
            <div className="flex justify-end items-center gap-2">
                {isRoutesDeletePermission && (
                    <ButtonWithIcon
                        text="Delete Routes"
                        variant="danger"
                        onClick={handleDeleteRoutes}
                    />
                )}
                {isAssignRoutesPermission && (
                    <ButtonWithIcon
                        text="Assign Routes"
                        variant="secondary"
                        onClick={handleAssignRoutes}
                    />
                )}
                {isCreatePermission && (
                    <ButtonWithIcon
                        text="Generate Routes"
                        variant="primary"
                        onClick={handleGenerateRoutes}
                    />
                )}
            </div>

            <Table
                tableTitle="Routes"
                columns={columns}
                rows={displayRoutes}
                tabs={tabs}
                filterStatus={tabCurrentStatus}
                setFilterStatus={setTabCurrentStatus}
                searchBarData={paginatedRoutes}
                searchBarSetData={setDisplayRoutes}
                sortDropdownData={paginatedRoutes}
                sortDropdownSetData={setDisplayRoutes}
                sortDropdownOptions={sortOptions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={routes.length}
                isLoading={isLoading}
            />

            {isDeleteRouteModalOpen && (
                <VendorSelectionModal
                    isLoading={isLoading}
                    onConfirm={deleteRoutesForSelectedVendor}
                    onCancel={() => setIsDeleteRouteModalOpen(false)}
                />
            )}
            {isGenerateRouteModalOpen && (
                <VendorSelectionModal
                    isLoading={isLoading}
                    onConfirm={generateRoutes}
                    onCancel={() => setIsGenerateRouteModalOpen(false)}
                />
            )}
            {isSendRouteModalOpen && (
                <VendorSelectionModal
                    isLoading={isLoading}
                    onConfirm={sendRoutesToRider}
                    onCancel={() => setIsSendRouteModalOpen(false)}
                />
            )}
        </div>
    );
}