import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { usePaginationController } from "../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../util/PaginationFilteredData/PaginatedData.jsx";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';
import CustomDropdown from "../../elements/customDropdown/CustomDropdown.jsx";
import ParticipantsStatusModal from "../participants/participantsStatusModal/ParticipantsStatusModal.jsx";
import statusStyles from "../../util/statusStyles/StatusStyles.js";
import Table from "../../elements/table/Table.jsx";
import customersMiddleware from "../../redux/middleware/customersMiddleware.js";
import capitalizeFirstLetter from "../../util/capitalizeFirstLetter/CapitalizeFirstLetter.js";

export default function ActiveParticipants() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [participants, setParticipants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState();

    // Paginated data
    const paginatedParticipants = usePaginatedData(participants, currentPage, itemsPerPage);
    const [displayParticipants, setDisplayParticipants] = useState(paginatedParticipants);

    const sortOptions = [
        { value: 'oldest', label: 'Sort by: Oldest' },
        { value: 'newest', label: 'Sort by: Newest' },
    ];

    const columns = [
        { key: 'name', header: 'Participant Name' },
        { key: 'memberId', header: 'MemberID' },
        { key: 'phone', header: 'Phone Number' },
        { key: 'insurance.m_auth_units_approved', header: 'Auth Units' },
        { key: 'insurance.m_frequency', header: 'Frequency' },
        {
            key: 'status',
            header: 'Status',
            accessor: (row) => (
                <div className="py-3 pr-5 flex items-center ">
                    <CustomDropdown
                        id="status"
                        name="status"
                        className={statusStyles[capitalizeFirstLetter(row?.status)]}
                        value={row.status}
                        onChange={(e) => handleInputChange(e, row)}
                        placeholder="Select Status"
                        options={[
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                        ]}
                    />
                </div>
            ),
        },
        {
            key: 'details',
            header: 'Details',
            accessor: (row) => (
                <button onClick={() => handleDetailsClick(row)} className="py-3 px-5">
                    <img src={EyeIcon} alt="View" width={18} height={18} />
                </button>
            ),
        },
    ];

    const handleDetailsClick = (member) => {
        navigate('/participants/participant-fields', {
            state: {
                memberData: member,
                isEditable: false,
                actionType: "update-participant"
            }
        });
    };

    const handleInputChange = (e, customer) => {
        const { value } = e.target;
        if (value === 'inactive') {
            setFormData({
                ...customer,
                customer: customer._id,
                status: value,
            });
            setIsModalOpen(true);
        }
    };

    const onConfirm = async (data) => {
        const statusBody = {
            status: data?.status,
            pauseStartDt: data?.pauseStartDt,
            pauseEndDt: data?.pauseEndDt
        };
        try {
            const response = await dispatch(customersMiddleware.UpdateCustomer(data?._id, statusBody));
            if (response.success) {
                fetchData();
            }
        } catch (error) {
            console.error("Error updating customer:", error);
        }
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await dispatch(customersMiddleware.GetAllCustomers('active'));
            setParticipants(response?.customers || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    // Update display participants when paginated data changes
    useEffect(() => {
        setDisplayParticipants(paginatedParticipants);
    }, [paginatedParticipants]);

    // Derived values
    const totalPages = Math.ceil(participants.length / itemsPerPage);

    return (
        <>
            <Table
                tableTitle="All Participants"
                tableSubTitle="Active Members"
                columns={columns}
                rows={displayParticipants}
                searchBarData={paginatedParticipants}
                searchBarSetData={setDisplayParticipants}
                sortDropdownData={paginatedParticipants}
                sortDropdownSetData={setParticipants}
                sortDropdownOptions={sortOptions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={participants.length}
                isLoading={isLoading}
            />

            {isModalOpen && (
                <ParticipantsStatusModal
                    onCancel={() => setIsModalOpen(false)}
                    formData={formData}
                    onConfirm={onConfirm}
                />
            )}
        </>
    );
}