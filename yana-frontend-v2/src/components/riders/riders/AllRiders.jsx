import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { usePaginationController } from "../../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../../util/PaginationFilteredData/PaginatedData.jsx";
import Table from "../../../elements/table/Table";
import EyeIcon from '../../../assets/customIcons/generalIcons/EyeIcon.svg';
import edit from "../../../assets/customIcons/generalIcons/edit.svg";
import TrashIcon from "../../../assets/customIcons/generalIcons/trash.svg";
import DeleteRiderModal from "./DeleteRiderModal";
import ridersMiddleware from "../../../redux/middleware/ridersTracking/ridersMiddleware";

const tabs = [
    { value: 'all', label: 'All', activeClass: 'text-purple-500' },
    { value: 'active', label: 'Active', activeClass: 'text-green' },
    { value: 'inactive', label: 'Inactive', activeClass: 'text-purple-500' },
];

const sortOptions = [
    { value: 'oldest', label: 'Sort by: Oldest' },
    { value: 'newest', label: 'Sort by: Newest' },
];

export default function AllRiders({ isCreatePermission, isEditPermission, isDeletePermission }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.user);

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [riders, setRiders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [riderDetails, setRiderDetails] = useState(null);

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
    const paginatedRiders = usePaginatedData(riders, currentPage, itemsPerPage);
    const [displayRiders, setDisplayRiders] = useState(paginatedRiders);

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'phone', header: 'Mobile No' },
        { key: 'vehicle_no', header: 'Vehicle No' },
        { key: 'vendorId.name', header: 'Vendor' },
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
            key: 'actions',
            header: 'Actions',
            accessor: (row) => (
                <div className="flex py-2 gap-1">
                    <button onClick={() => navigate('/riders/edit-rider', { state: { riderDetails: row, isEditable: false } })}>
                        <img src={EyeIcon} alt="View" width={18} height={18} />
                    </button>
                    {isEditPermission && (
                        <button onClick={() => navigate('/riders/edit-rider', { state: { riderDetails: row, isEditable: true } })}>
                            <img src={edit} alt="View" width={18} height={18} />
                        </button>
                    )}
                    {isDeletePermission && (
                        <button onClick={() => { 
                            setRiderDetails(row); 
                            setIsDeleteModalOpen(true); 
                        }}>
                            <img src={TrashIcon} alt="View" width={14} height={14} />
                        </button>
                    )}
                </div>
            )
        },
    ];

    const handleToggleActive = async (e, row) => {
        e.stopPropagation();
        const body = {
            "status": row?.status === 'active' ? 'inactive' : 'active',
            "gender": row?.gender,
            "vendorId": row?.vendorId?._id
        };

        try {
            setIsLoading(true);
            const response = await dispatch(ridersMiddleware.UpdateRider(row?._id, body));
            if (response.success) {
                fetchRiders();
            }
        } catch (error) {
            console.log("Error", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRiders();
    }, [tabCurrentStatus]);

    useEffect(() => {
        setDisplayRiders(paginatedRiders);
    }, [paginatedRiders]);

    const fetchRiders = async () => {
        setIsLoading(true);
        try {
            const response = await dispatch(ridersMiddleware.GetAllRiders(tabCurrentStatus));
            setRiders(response?.riders || []);
        } catch (error) {
            console.error("Error fetching riders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived values
    const totalPages = Math.ceil(riders.length / itemsPerPage);

    return (
        <>
            <Table
                tableTitle="Riders"
                columns={columns}
                rows={displayRiders}
                tabs={tabs}
                filterStatus={tabCurrentStatus}
                setFilterStatus={setTabCurrentStatus}
                searchBarData={paginatedRiders}
                searchBarSetData={setDisplayRiders}
                sortDropdownData={paginatedRiders}
                sortDropdownSetData={setDisplayRiders}
                sortDropdownOptions={sortOptions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={riders.length}
                isLoading={isLoading}
            />
            
            {isDeleteModalOpen && (
                <DeleteRiderModal 
                    fetchRiders={fetchRiders} 
                    riderDetails={riderDetails} 
                    onCancel={() => setIsDeleteModalOpen(false)} 
                />
            )}
        </>
    );
}