import { useState, useEffect } from 'react';
import { usePaginationController } from '../../../util/PaginationFilteredData/PaginationController.jsx';
import { usePaginatedData } from '../../../util/PaginationFilteredData/PaginatedData.jsx';
import Table from '../../../elements/table/Table';
import { useDispatch } from 'react-redux';
import customersMiddleware from '../../../redux/middleware/customersMiddleware';
import ParticipantsChangesModal from './ParticipantsChangesModal';
import EyeIcon from '../../../assets/customIcons/generalIcons/EyeIcon.svg';
import statusStyles from '../../../util/statusStyles/StatusStyles';
import capitalizeFirstLetter from '../../../util/capitalizeFirstLetter/CapitalizeFirstLetter';

export default function ParticipantsChangesTable() {
    const dispatch = useDispatch();

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [customerChanges, setCustomerChanges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [singleCustomer, setSingleCustomer] = useState(null);

    // Paginated data
    const paginatedCustomers = usePaginatedData(customerChanges, currentPage, itemsPerPage);
    const [displayCustomers, setDisplayCustomers] = useState(paginatedCustomers);

    const columns = [
        { key: 'customerName', header: 'Name' },
        { key: 'medicaidId', header: 'Medical Id' },
        { key: 'memberId', header: 'Member Id' },
        {
            key: 'status',
            header: 'Status',
            accessor: (row) => (
                <span className={`px-3 py-1 rounded-full text-sm border min-w-[100px] text-center ${statusStyles[capitalizeFirstLetter(row?.status)]}`}>
                    {capitalizeFirstLetter(row?.status)}
                </span>
            ),
        },
        {
            key: 'update',
            header: 'Update',
            accessor: (row) => (
                <button 
                    onClick={() => handleModalClick(row)} 
                    className="py-3 px-4 flex items-center"
                >
                    <img src={EyeIcon} alt="View" width={18} height={18} />
                </button>
            ),
        },
    ];

    useEffect(() => {
        fetchCustomersChanges();
    }, []);

    useEffect(() => {
        setDisplayCustomers(paginatedCustomers);
    }, [paginatedCustomers]);

    const fetchCustomersChanges = async () => {
        setIsLoading(true);
        try {
            const response = await dispatch(customersMiddleware.GetCustomersChanges());
            setCustomerChanges(response?.pendingChanges || []);
        } catch (error) {
            console.error("Error fetching customer changes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalClick = (customer) => {
        setSingleCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setSingleCustomer(null);
        setIsModalOpen(false);
    };

    // Derived values
    const totalPages = Math.ceil(customerChanges.length / itemsPerPage);

    return (
        <>
            <Table
                tableTitle="Participants Changes"
                columns={columns}
                rows={displayCustomers}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={customerChanges.length}
                searchBarData={paginatedCustomers}
                searchBarSetData={setDisplayCustomers}
                isLoading={isLoading}
            />

            {isModalOpen && (
                <ParticipantsChangesModal
                    fetchCustomersChanges={fetchCustomersChanges}
                    onCancel={handleCancel}
                    customer={singleCustomer}
                />
            )}
        </>
    );
}