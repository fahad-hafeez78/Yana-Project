import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePaginationController } from "../../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../../util/PaginationFilteredData/PaginatedData.jsx";
import Table from '../../../elements/table/Table';
import approveIcon from '../../../assets/customIcons/participantsIcons/approveIcon.svg';
import customersMiddleware from '../../../redux/middleware/customersMiddleware';
import CustomerCredentialsModal from '../participantsCredentialsModal/ParticipantsCredentialsModal';
import CustomDropdown from '../../../elements/customDropdown/CustomDropdown';
import statusStyles from '../../../util/statusStyles/StatusStyles';
import edit from "../../../assets/customIcons/generalIcons/edit.svg"
import ParticipantsStatusModal from '../participantsStatusModal/ParticipantsStatusModal';
import EyeIcon from '../../../assets/customIcons/generalIcons/EyeIcon.svg';
import capitalizeFirstLetter from '../../../util/capitalizeFirstLetter/CapitalizeFirstLetter';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon';
import usePermissionChecker from '../../../util/permissionChecker/PermissionChecker';

export default function ParticipantsAllTabs() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const checkPermission = usePermissionChecker();
    const { user } = useSelector((state) => state.user);

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [allCustomers, setAllCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [credentials, setCredentials] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [formData, setFormData] = useState();

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
    const paginatedCustomers = usePaginatedData(allCustomers, currentPage, itemsPerPage);
    const [displayCustomers, setDisplayCustomers] = useState(paginatedCustomers);

    // Permissions
    const isEditable = checkPermission('participant', 'edit');
    const isViewPendingPermission = checkPermission('participant', 'pending');
    const isViewApprovedPermission = checkPermission('participant', 'approve');
    const isPermissionToGenerateCredentials = checkPermission('participant', 'generateCredentials');

    const columns = [
        { key: 'name', header: 'Participant Name' },
        { key: 'memberId', header: 'MemberID' },
        { key: 'phone', header: 'Phone Number' },
        {
            key: 'insurance.m_auth_units_approved',
            header: 'Auth Units',
            accessor: (row) => (
                <>
                    {row?.insurance?.m_auth_units_approved && <span>M-{row?.insurance?.m_auth_units_approved}, </span>}
                    {row?.insurance?.p_auth_units_approved && <span>P-{row?.insurance?.p_auth_units_approved}</span>}
                </>
            )
        },
        {
            key: 'insurance.m_frequency',
            header: 'Frequency',
            accessor: (row) => (
                <>
                    {row?.insurance?.m_frequency && <span>M-{row?.insurance?.m_frequency}, </span>}
                    {row?.insurance?.p_frequency && <span>P-{row?.insurance?.p_frequency}</span>}
                </>
            )
        },
        { key: 'vendorId.name', header: 'Vendor' },
        {
            key: 'status',
            header: 'Status',
            accessor: (row) => (
                <div className="py-2 pr-5 flex">
                    <CustomDropdown
                        id="status"
                        name="status"
                        className={statusStyles[capitalizeFirstLetter(row?.status)]}
                        value={row.status}
                        disabled={row.status === 'approved' || row.status === 'pending' || !isEditable}
                        onChange={(e) => handleInputChange(e, row)}
                        placeholder="Select Status"
                        options={
                            row.status === "approved" || row.status === "pending"
                                ? allOptions
                                : allOptions.filter(
                                    option => option.value === "active" || option.value === "inactive"
                                )}
                    />
                    {(tabCurrentStatus === 'approved' && isPermissionToGenerateCredentials) && (
                        <ButtonWithIcon
                            icon={<img src={approveIcon} alt="Plus Circle Icon" className="w-22 h-22" />}
                            onClick={() => handlePlusCircleClickForApproved(row)}
                            className="text-yellow-500"
                        />
                    )}
                </div>
            ),
        },
        {
            key: 'Actions',
            header: 'Actions',
            accessor: (row) => (
                isEditable ? (
                    <div className='flex'>
                        <ButtonWithIcon
                            icon={<img src={EyeIcon} alt="View" className="w-5 h-5" />}
                            onClick={() => navigate('/participants/participant-fields', { state: { memberData: row, isEditable: false, actionType: "update-participant" } })}
                        />
                        <ButtonWithIcon
                            icon={<img src={edit} alt="Edit" className="w-5 h-5" />}
                            onClick={() => handleEditClick(row)}
                        />
                    </div>
                ) : (
                    <ButtonWithIcon
                        icon={<img src={EyeIcon} alt="View" className="w-5 h-5" />}
                        onClick={() => navigate('/participants/participant-fields', { state: { memberData: row, isEditable: false, actionType: "update-participant" } })}
                    />
                )
            ),
        },
    ];

    const tabs = [
        { value: 'all', label: 'All', activeClass: 'text-grey-500' },
        { value: 'active', label: 'Active', activeClass: 'text-green' },
        { value: 'inactive', label: 'Inactive', activeClass: 'text-red' },
        ...(isViewApprovedPermission
            ? [{ value: 'approved', label: 'Approved', activeClass: 'text-green' }]
            : []),
        ...(isViewPendingPermission
            ? [{ value: 'pending', label: 'Pending', activeClass: 'text-yellow-500' }]
            : []),
    ];

    const sortOptions = [
        { value: 'oldest', label: 'Sort by: Oldest' },
        { value: 'newest', label: 'Sort by: Newest' },
    ];

    const allOptions = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "approved", label: "Approved" },
        { value: "pending", label: "Pending" },
    ];

    const handleEditClick = (member) => {
        if (tabCurrentStatus === 'all') {
            if (member.status === "active" || member.status === "inactive") {
                navigate('/participants/participant-fields', { state: { memberData: member, isEditable: true, actionType: "update-participant" } });
            }
            else if (member.status === "pending") {
                navigate('/participants/participant-fields', { state: { memberData: member, isEditable: true, actionType: "participant-pending-form" } });
            }
            else if (member.status === "approved") {
                navigate('/participants/participant-fields', { state: { memberData: member, isEditable: true, actionType: "update-participant" } });
            }
            return;
        }
        if (tabCurrentStatus === 'active' || tabCurrentStatus === 'inactive') {
            navigate('/participants/participant-fields', { state: { memberData: member, isEditable: true, actionType: "update-participant" } });
        }
        else if (member.status === "pending") {
            navigate('/participants/participant-fields', { state: { memberData: member, isEditable: true, actionType: "participant-pending-form" } });
        }
        else if (member.status === "approved") {
            navigate('/participants/participant-fields', { state: { memberData: member, isEditable: true, actionType: "update-participant" } });
        }
    };

    const handlePlusCircleClickForApproved = async (member) => {
        const customerBody = {
            "customerId": member._id
        }
        try {
            setIsLoading(true);
            const response = await dispatch(customersMiddleware.GenerateCustomerCredentials(customerBody));

            if (response?.success) {
                setCredentials({
                    username: response?.data?.username,
                    password: response?.data?.password
                });
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("Error sending form data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalConfirm = () => {
        setIsModalOpen(false);
        fetchCustomers();
    };

    const handleInputChange = (e, customer) => {
        e.preventDefault();
        const { value } = e.target;

        const updatedFormData = {
            ...customer,
            status: value,
        };

        setFormData(updatedFormData);

        if (value === 'inactive') {
            setIsStatusModalOpen(true);
        } else {
            const removeDates = {
                _id: customer._id,
                status: 'active',
                pauseStartDt: null,
                pauseEndDt: null,
            }
            onConfirm(removeDates);
        }
    };

    const onConfirm = async (updatedFormData) => {
        try {
            const pauseFields = {
                status: updatedFormData?.status,
                pauseStartDt: updatedFormData?.pauseStartDt,
                pauseEndDt: updatedFormData?.pauseEndDt
            }
            const response = await dispatch(customersMiddleware.UpdateCustomer(updatedFormData?._id, pauseFields));

            if (response.success) {
                fetchCustomers();
            }
        } catch (error) {
            console.error("Error updating customer:", error);
        } finally {
            setIsStatusModalOpen(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [tabCurrentStatus]);

    useEffect(() => {
        setDisplayCustomers(paginatedCustomers);
    }, [paginatedCustomers]);

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            const response = await dispatch(customersMiddleware.GetAllCustomers(tabCurrentStatus));
            setAllCustomers(response?.customers || []);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived values
    const totalPages = Math.ceil(allCustomers.length / itemsPerPage);

    return (
        <>
            <Table
                tableTitle="Participants"

                tabs={tabs}
                filterStatus={tabCurrentStatus}
                setFilterStatus={setTabCurrentStatus}

                columns={columns}
                rows={displayCustomers}

                searchBarData={paginatedCustomers}
                searchBarSetData={setDisplayCustomers}

                sortDropdownData={paginatedCustomers}
                sortDropdownSetData={setDisplayCustomers}
                sortDropdownOptions={sortOptions}

                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={allCustomers.length}
                isLoading={isLoading}
            />

            {isModalOpen && (
                <CustomerCredentialsModal
                    credentials={credentials}
                    onConfirm={handleModalConfirm}
                />
            )}

            {isStatusModalOpen && (
                <ParticipantsStatusModal
                    onCancel={() => setIsStatusModalOpen(false)}
                    formData={formData}
                    setFormData={setFormData}
                    onConfirm={onConfirm}
                />
            )}
        </>
    );
}