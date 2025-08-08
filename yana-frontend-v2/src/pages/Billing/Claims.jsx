import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { usePaginationController } from "../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../util/PaginationFilteredData/PaginatedData.jsx";
import Table from "../../elements/table/Table";
import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon";
import AddMealIcon from '../../assets/customIcons/generalIcons/AddCircle.svg';
import billingMiddleware from "../../redux/middleware/billingMiddleware";
import moment from "moment";
import capitalizeFirstLetter from "../../util/capitalizeFirstLetter/CapitalizeFirstLetter";
import statusStyles from "../../util/statusStyles/StatusStyles";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';
import edit from "../../assets/customIcons/generalIcons/edit.svg";
import TrashIcon from "../../assets/customIcons/generalIcons/trash.svg";
import DeleteClaimModal from "../../components/Billings/claims/DeleteClaimModal";
import usePermissionChecker from "../../util/permissionChecker/PermissionChecker";

const tabs = [
    { value: 'all', label: 'All', activeClass: 'text-purple-500' },
    { value: 'in_process', label: 'In-process', activeClass: 'text-yellow-500' },
    { value: 'paid', label: 'Paid', activeClass: 'text-green' },
    { value: 'partially_paid', label: 'Partially-paid', activeClass: 'text-green-light' },
    { value: 'denied', label: 'Denied', activeClass: 'text-red' },
    { value: 'billed', label: 'Billed', activeClass: 'text-green' },
];

const sortOptions = [
    { value: 'oldest', label: 'Sort by: Oldest' },
    { value: 'newest', label: 'Sort by: Newest' },
];

export default function Claims() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [claims, setClaims] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [claimDetails, setClaimDetails] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Tab state with search params
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabCurrentStatus, setTabCurrentStatus] = useState(searchParams.get('tab') || 'all');

    // Permissions
    const checkPermission = usePermissionChecker();
    const isAddClaimPermission = checkPermission('claim', 'create');
    const isEditClaimPermission = checkPermission('claim', 'edit');
    const isDeleteClaimPermission = checkPermission('claim', 'delete');

    // Paginated data
    const paginatedClaims = usePaginatedData(claims, currentPage, itemsPerPage);
    const [displayClaims, setDisplayClaims] = useState(paginatedClaims);

    const columns = [
        { key: 'claim_num', header: 'Claim No' },
        { key: 'customer.name', header: 'Name' },
        {
            key: 'created_date',
            header: 'Created Date',
            accessor: (row) => moment.utc(row?.created_date).format("MM-DD-YYYY")
        },
        { key: 'customer.memberId', header: 'Member Id' },
        { key: 'order.order_id', header: 'Order Id' },
        { key: 'facility', header: 'Facility' },
        {
            key: 'status',
            header: 'Status',
            accessor: (row) => (
                <div className="py-2 flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm border min-w-[100px] text-center ${statusStyles[row?.status] || statusStyles.default}`}>
                        {capitalizeFirstLetter(row?.status)}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            accessor: (row) => (
                <div className="flex py-2 gap-1">
                    <button onClick={() => navigate('/billing/claims/edit-claim', { 
                        state: { 
                            claimDetails: row, 
                            isEditable: false, 
                            isStatusEditable: false 
                        } 
                    })}>
                        <img src={EyeIcon} alt="View" width={18} height={18} />
                    </button>
                    {isEditClaimPermission && (
                        <button onClick={() => navigate('/billing/claims/edit-claim', { 
                            state: { 
                                claimDetails: row, 
                                isEditable: false, 
                                isStatusEditable: true 
                            } 
                        })}>
                            <img src={edit} alt="View" width={18} height={18} />
                        </button>
                    )}
                    {isDeleteClaimPermission && (
                        <button onClick={() => { 
                            setClaimDetails(row); 
                            setIsDeleteModalOpen(true); 
                        }}>
                            <img src={TrashIcon} alt="View" width={14} height={14} />
                        </button>
                    )}
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
        fetchClaims();
    }, [tabCurrentStatus]);

    useEffect(() => {
        setDisplayClaims(paginatedClaims);
    }, [paginatedClaims]);

    const fetchClaims = async () => {
        try {
            setIsLoading(true);
            const response = await dispatch(billingMiddleware.GetAllClaim(tabCurrentStatus));
            setClaims(response?.claims || []);
        } catch (error) {
            console.error("Error fetching claims:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived values
    const totalPages = Math.ceil(claims.length / itemsPerPage);

    return (
        <div className="flex flex-col h-full gap-3">
            {isAddClaimPermission && (
                <div className="flex gap-3 justify-end items-center">
                    <ButtonWithIcon
                        onClick={() => navigate('/billing/claims/add-claim')}
                        icon={<img src={AddMealIcon} alt="import file" width={24} height={24} />}
                        text="Add Claim"
                        variant='primary'
                    />
                </div>
            )}
            
            <Table
                tableTitle="Claims"
                columns={columns}
                rows={displayClaims}
                searchBarData={paginatedClaims}
                searchBarSetData={setDisplayClaims}
                sortDropdownData={paginatedClaims}
                sortDropdownSetData={setDisplayClaims}
                sortDropdownOptions={sortOptions}
                tabs={tabs}
                filterStatus={tabCurrentStatus}
                setFilterStatus={setTabCurrentStatus}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={claims.length}
                isLoading={isLoading}
            />
            
            {isDeleteModalOpen && (
                <DeleteClaimModal 
                    claimDetails={claimDetails} 
                    onCancel={() => setIsDeleteModalOpen(false)} 
                    fetchClaims={fetchClaims} 
                />
            )}
        </div>
    );
}