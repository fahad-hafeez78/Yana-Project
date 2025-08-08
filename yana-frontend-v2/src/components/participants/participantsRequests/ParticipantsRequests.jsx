import { useState, useEffect } from 'react';
import moment from "moment";
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { usePaginationController } from "../../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../../util/PaginationFilteredData/PaginatedData.jsx";
import customersMiddleware from '../../../redux/middleware/customersMiddleware';
import Table from '../../../elements/table/Table';
import usePermissionChecker from '../../../util/permissionChecker/PermissionChecker';
import capitalizeFirstLetter from '../../../util/capitalizeFirstLetter/CapitalizeFirstLetter';
import CustomDropdown from '../../../elements/customDropdown/CustomDropdown';

// Reusable StatusBadge Component
const StatusBadge = ({ status }) => {
    const statusStyles = {
        Rejected: 'bg-red-100 text-red-dark border-red-dark',
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-700',
        Approved: 'bg-blue-100 text-blue-700 border-blue-700',
        default: 'bg-gray-100 text-gray-dark border-gray-dark',
    };

    return (
        <span className={`px-3 py-1 align-center border rounded-full text-xs font-semibold min-w-[100px] text-center ${statusStyles[status] || statusStyles.default}`}>
            {status}
        </span>
    );
};

const ParticipantsRequests = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const checkPermission = usePermissionChecker();
    const isEditPermission = checkPermission('participant_requests', 'edit');

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [requests, setRequests] = useState([]);
    // const [filteredRequests, setFilteredRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    // Paginated data
    const paginatedRequests = usePaginatedData(requests, currentPage, itemsPerPage);
    const [displayRequests, setDisplayRequests] = useState(paginatedRequests);

    const tabs = [
        { value: 'all', label: 'All', activeClass: 'text-purple-500' },
        { value: 'pending', label: 'Pending', activeClass: 'text-yellow-500' },
        { value: 'approved', label: 'Approved', activeClass: 'text-blue-600' },
        { value: 'rejected', label: 'Rejected', activeClass: 'text-red' },
    ];

    const sortOptions = [
        { value: 'oldest', label: 'Sort by: Oldest' },
        { value: 'newest', label: 'Sort by: Newest' },
    ];

    const columns = [
        {
            key: 'customer.name',
            header: 'Participant Name',
            accessor: (row) => row?.customer?.name,
        },
        {
            key: 'type',
            header: 'Request Type',
            accessor: (row) => capitalizeFirstLetter(row?.type),
        },
        { key: 'request', header: 'Request' },
        {
            key: 'createdAt', 
            header: 'Created date',
            accessor: (row) => moment(row?.createdAt).format("MM-DD-YYYY")
        },
        { key: 'customer.vendor.name', header: 'Vendor' },
        {
            key: 'status',
            header: 'Status',
            accessor: (row) => (
                <div className="py-3 flex align-center items-center">
                    <StatusBadge status={capitalizeFirstLetter(row?.status)} />
                </div>
            ),
        },
        ...((user?.role?.name === 'admin' && (tabCurrentStatus === "pending" || tabCurrentStatus === "all")) ? [
            {
                key: 'Actions',
                header: 'Actions',
                accessor: (row) => (
                    (tabCurrentStatus === "pending" || tabCurrentStatus === "all") &&
                    <div className="py-2 align-center items-center">
                        <CustomDropdown
                            name="action"
                            value=""
                            onChange={(e) => handleActionSelect(e.target.value, row)}
                            disabled={row.status === "approved" || row.status === "rejected" || !isEditPermission}
                            options={[
                                { value: "", label: "Select Action" },
                                { value: "approved", label: "Approve" },
                                { value: "rejected", label: "Reject" },
                            ]}
                        />
                    </div>
                ),
            }
        ] : []),
    ];

    const fetchCustomerRequests = async () => {
        try {
            setIsLoading(true);
            const response = await dispatch(customersMiddleware.GetCustomerRequests(tabCurrentStatus));
            setRequests(response.requests || []);
            // setFilteredRequests(response.requests || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionSelect = async (action, request) => {
        const requestData = {
            requestId: request._id,
            action: action
        };

        try {
            setIsLoading(true);
            const response = await dispatch(customersMiddleware.UpdateCustomerRequest(requestData));
            if (response?.success) {
                fetchCustomerRequests();
            }
        } catch (error) {
            console.error(`Failed to ${action} request ${request._id}:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerRequests();
    }, [tabCurrentStatus]);

    // useEffect(() => {
    //     if (tabCurrentStatus === 'all') {
    //         setDisplayRequests(requests);
    //     } else {
    //         setDisplayRequests(requests.filter(req => req.status === tabCurrentStatus));
    //     }
    //     // setCurrentPage(1);
    // }, [tabCurrentStatus, requests]);

    useEffect(() => {
        setDisplayRequests(paginatedRequests);
    }, [paginatedRequests]);

    // Derived values
    const totalPages = Math.ceil(requests.length / itemsPerPage);

    return (
        <Table
            tableTitle="Participant Requests"
            tabs={tabs}
            filterStatus={tabCurrentStatus}
            setFilterStatus={setTabCurrentStatus}
            columns={columns}
            rows={displayRequests}

            searchBarData={paginatedRequests}
            searchBarSetData={setDisplayRequests}

            sortDropdownData={paginatedRequests}
            sortDropdownSetData={setDisplayRequests}
            sortDropdownOptions={sortOptions}

            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={requests.length}
            isLoading={isLoading}
        />
    );
};

export default ParticipantsRequests;