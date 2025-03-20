import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import customersMiddleware from '../../../redux/middleware/customersMiddleware.js';
import Table from '../../../elements/table/Table.jsx';

// Reusable StatusBadge Component
const StatusBadge = ({ status }) => {
    const statusStyles = {
        Rejected: 'bg-red-100 text-red-700 border-red-700',
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-700',
        Approved: 'bg-blue-100 text-blue-700 border-blue-700',
        default: 'bg-gray-100 text-gray-700 border-gray-700',
    };

    return (
        <span className={`px-3 py-1 align-center border rounded-full text-xs font-semibold min-w-[100px] text-center ${statusStyles[status] || statusStyles.default}`}>
            {status}
        </span>
    );
};

const ParticipantsRequests = () => {
    const dispatch = useDispatch();
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [baseFilteredRequests, setBaseFilteredRequests] = useState([]);
    const [isLoading, setisLoading] = useState(true);

    const [tabCurrentStatus, setTabCurrentStatus] = useState('Pending');

    const tabs = [
        { value: 'Pending', label: 'Pending', activeClass: 'text-yellow-500' },
        { value: 'Approved', label: 'Approved', activeClass: 'text-blue-600' },
        { value: 'Rejected', label: 'Rejected', activeClass: 'text-red-500' },
    ];

    const itemsPerPage = 100;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const displayedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const fetchCustomerRequests = async () => {
        try {
            const response = await dispatch(customersMiddleware.GetCustomerRequests());
            setRequests(response.data);
            setFilteredRequests(response.data);
            setBaseFilteredRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
        finally {
            setisLoading(false); // Hide spinner
        }
    };

    // Fetch requests
    useEffect(() => {
        fetchCustomerRequests();
    }, [dispatch]);

    // Handle dropdown actions
    const handleActionSelect = async (action, request) => {
        // Log object with RequestID and Action
        const requestData = {
            RequestID: request._id,
            Action: action
        };

        try {
            const response = await dispatch(customersMiddleware.UpdateCustomerRequest(requestData));
            if (response.success) {
                fetchCustomerRequests()
            } else {
                console.error("Error Deleting Vendors");
            }
        } catch (error) {
            console.error(`Failed to ${action} request ${request._id}:`, error);
        }
    };

    const columns = [
        { key: 'CustomerName', header: 'Participant Name' },
        { key: 'Type', header: 'Request Type' },
        { key: 'Request', header: 'Request' },
    ];

    const sortOptions = [
        { value: 'oldest', label: 'Sort by: Oldest' },
        { value: 'newest', label: 'Sort by: Newest' },
    ];

    // Filter displayed requests based on tabCurrentStatus
    useEffect(() => {
        const filterByStatus = () => {
            const filtered = tabCurrentStatus === 'All'
                ? requests // Use requests state if 'All' is selected
                : requests.filter((req) => req.Status === tabCurrentStatus); // Filter based on selected status

            setFilteredRequests(filtered);
            setBaseFilteredRequests(filtered); // Update baseFilteredRequests for sorting and pagination
            setCurrentPage(1); // Reset to the first page when the filter changes
        };

        filterByStatus(); // Call the function to filter based on current tab status
    }, [tabCurrentStatus, requests]); // Trigger the effect when tabCurrentStatus or requests change


    return (
        <Table
            tableTitle="Participant Requests"

            tabs={tabs}
            filterStatus={tabCurrentStatus}
            setFilterStatus={setTabCurrentStatus}

            columns={columns}

            rows={displayedRequests}
            secondlastColumnName="Status"
            lastColumnName={tabCurrentStatus === "Pending" && "Actions"}

            searchBarData={baseFilteredRequests}
            searchBarSetData={setFilteredRequests}
            searchBarKey="CustomerName"
            searchBarclassName="h-8 bg-gray-100 border border-gray-100 rounded-md px-2"

            sortDropdownData={baseFilteredRequests}
            sortDropdownSetData={setFilteredRequests}
            sortDropdownOptions={sortOptions}


            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredRequests.length}

            tableHeight="h-[calc(100vh-280px)]"
            isLoading={isLoading}
        >
            {(request) => (
                <>
                    <td className="py-3 px-4 flex align-center items-center">
                        <StatusBadge status={request.Status} />
                    </td>
                    {tabCurrentStatus==="Pending" &&
                        <td className="py-2 px-4 align-center items-center">
                            <select
                                onChange={(e) => handleActionSelect(e.target.value, request)}
                                className="bg-gray-100 text-gray-600 align-center items-center py-1 px-4 rounded-lg focus:outline-none focus:bg-gray-200 focus:border-gray-500"
                                defaultValue=""
                                disabled={request.Status === "Approved" || request.Status === "Rejected"}
                            >
                                <option value="" disabled>
                                    Select Action
                                </option>
                                <option value="Approve">Approve</option>
                                <option value="Reject">Reject</option>
                            </select>
                        </td>
                    }
                </>
            )}
        </Table>
    );
};

export default ParticipantsRequests;
