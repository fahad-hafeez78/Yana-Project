import { useState, useEffect } from 'react';
import Table from '../../../elements/table/Table';
import EditIcon from '../../../assets/Check-Mark.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import pluscircle from '../../../assets/plus-circle.svg';
import { useDispatch } from 'react-redux';
import customersMiddleware from '../../../redux/middleware/customersMiddleware';
import CustomerCredentialsModal from '../participantsCredentialsModal/ParticipantsCredentialsModal';
import CustomDropdown from '../../../elements/customDropdown/CustomDropdown';
import statusStyles from '../../../util/statusStyles/StatusStyles';
import ParticipantsStatusModal from '../participantsStatusModal/ParticipantsStatusModal';

// Reusable PlusButton
const PlusButton = ({ onClick }) => (
    <button onClick={onClick} className="text-yellow-500">
        <img src={pluscircle} alt="Plus Circle Icon" width={22} height={22} />
    </button>
);

// Reusable EditButton
const EditButton = ({ onClick }) => (
    <button onClick={onClick} className="px-2 py-[3px] flex items-center bg-[#fe8c00] text-white rounded-full space-x-2">
        <img src={EditIcon} alt="edit-icon" className="w-5 h-5" />
        <span>Edit</span>
    </button>
);

export default function ParticipantsAllTabs() {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const location = useLocation();

    const [activeCustomers, setActiveCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [baseFilteredCustomers, setBaseFilteredCustomers] = useState([]); // New base state
    const [isLoading, setisLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [credentials, setCredentials] = useState(null);

    const [isStatusModalOpen, setisStatusModalOpen] = useState(false);
    const [formData, setformData] = useState();

    const [isDataUpdated, setisDataUpdated] = useState(false);

    const [tabCurrentStatus, setTabCurrentStatus] = useState('All');

    const itemsPerPage = 100;
    const [currentPage, setCurrentPage] = useState(1);


    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const displayedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const columns = [
        { key: 'Name', header: 'Participant Name' },
        { key: 'MemberID', header: 'MemberID' },
        { key: 'Phone', header: 'Phone Number' },
        {
            key: 'MAuthUnitsApproved',
            header: 'Auth Units',
            transform: (row) => {
                const authUnits = row?.MAuthUnitsApproved || row?.PAuthUnitsApproved;
                
                if (authUnits) {
                    const unitsArray = authUnits
                        .split(',')
                        .map((unit) => parseInt(unit.trim(), 10))
                        .filter((unit) => !isNaN(unit));
        
                    const maxUnit = Math.max(...unitsArray);
                    const maxUnitIndex = unitsArray.indexOf(maxUnit);
        
                    row.maxUnitIndex = maxUnitIndex;
        
                    return maxUnit;
                }
                return '0';
            },
        },
        {
            key: 'MFrequency',
            header: 'Frequency',
            transform: (row) => {
                const frequency = row?.MFrequency || row?.PFrequency;
        
                if (frequency && row.maxUnitIndex !== undefined) {
                    const frequencies = frequency.split(',').map((freq) => freq.trim());
                    return frequencies[row.maxUnitIndex] || 'N/A';
                }
                return 'N/A';
            },
        },

    ];

    const tabs = [
        { value: 'All', label: 'All', activeClass: 'text-grey-500' },
        { value: 'Active', label: 'Active', activeClass: 'text-green-500' },
        { value: 'Inactive', label: 'Inactive', activeClass: 'text-red-500' },
        { value: 'Approved', label: 'Approved', activeClass: 'text-green-500' },
        { value: 'Pending', label: 'Pending', activeClass: 'text-yellow-500' },
    ];

    const sortOptions = [
        { value: 'oldest', label: 'Sort by: Oldest' },
        { value: 'newest', label: 'Sort by: Newest' },
    ];

    const allOptions = [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
        { value: "Approved", label: "Approved" },
        { value: "Pending", label: "Pending" },
    ];

    const handleEditClick = (member) => {
        if (tabCurrentStatus === 'All') {
            if (member.Status === "Active" || member.Status === "Inactive") {
                navigate('/dashboard/participants-details', { state: { memberData: member } });
            } else if (member.Status === "Pending" || member.Status === "Approved") {
                navigate('/participants/client-details', { state: { memberData: member } });
            }
            return;
        }
        if (tabCurrentStatus === 'Active' || tabCurrentStatus === 'Inactive') {
            navigate('/dashboard/participants-details', { state: { memberData: member } });
        } else if (tabCurrentStatus === 'Approved' || tabCurrentStatus === 'Pending') {
            navigate('/participants/client-details', { state: { memberData: member } });
        }
    };

    //It will call when the user click on plus button on tabs Pending and Approved
    const handlePlusButtonClick = (customer) => {
        if (tabCurrentStatus === 'Pending') {
            handlePlusCircleClickForPending(customer);
        } else if (tabCurrentStatus === 'Approved') {
            handlePlusCircleClickForApproved(customer);
        }
    };

    const handlePlusCircleClickForPending = (member) => {
        navigate('/participants/client-details', { state: { memberData: member } });
    };

    const handlePlusCircleClickForApproved = async (participant) => {
        const participantId = participant._id;

        try {
            const response = await dispatch(customersMiddleware.GenerateCustomerCredentials(participantId));
            if (response.success) {
                setCredentials({
                    username: response.data.userName,
                    password: response.data.password
                });
                setIsModalOpen(true); // Open the modal
            } else {
                console.error("Error creating account:", response.message || "Unknown error");
            }
        } catch (error) {
            console.error("Error sending form data:", error);
        }
    };


    const handleModalConfirm = () => {
        setIsModalOpen(false);
        navigate('/participants', { state: { refresh: true } });
    };

    const handleInputChange = (e, customer) => {
        e.preventDefault();
        const { value } = e.target;

        // Create a local form data object
        const updatedFormData = {
            ...customer,
            CustomerID: customer._id,
            Status: value,
        };

        // Update the state
        setformData(updatedFormData);

        if (value === 'Inactive') {
            setisStatusModalOpen(true); // Open the modal for confirmation
        } else {
            // Pass the updated form data to the confirmation function directly
            const removeDates = {
                ...updatedFormData,
                PauseStartDt: null, // Format before storing
                PauseEndDt: null,
            }
            onConfirm(removeDates);
        }
    };

    const onConfirm = async (updatedFormData) => {
        try {
            const response = await dispatch(customersMiddleware.UpdateCustomer(formData.CustomerID, updatedFormData));
            if (response.success) {
                setActiveCustomers((prev) =>
                    prev.map((customer) =>
                        customer._id === updatedFormData.CustomerID
                            ? { ...customer, ...updatedFormData }
                            : customer
                    )
                );

                setisDataUpdated(true)
            }
        } catch (error) {
            console.error("Error updating customer:", error);
        } finally {
            setisStatusModalOpen(false);
        }
    };


    useEffect(() => {
        //
    }, [isDataUpdated])

    useEffect(() => {
        const fetchCustomers = async () => {
            setisLoading(true);
            try {
                const response = await dispatch(customersMiddleware.GetAllCustomers());
                setFilteredCustomers(response.data)
                setActiveCustomers(response.data)
                setBaseFilteredCustomers(response.data);
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
            finally {
                setisLoading(false); // Hide spinner
                setisDataUpdated(false)
            }
        };

        fetchCustomers();

    }, [dispatch, location]);


    useEffect(() => {
        const filterByStatus = () => {
            const filtered = tabCurrentStatus === 'All'
                ? activeCustomers
                : activeCustomers.filter(customer => customer.Status.toLowerCase() === tabCurrentStatus.toLowerCase());

            setFilteredCustomers(filtered);
            setBaseFilteredCustomers(filtered);
            setCurrentPage(1);
        };


        filterByStatus();
    }, [tabCurrentStatus, activeCustomers]);

    return (

        <>
            <Table
                tableTitle="Participants"

                tabs={tabs}
                filterStatus={tabCurrentStatus}
                setFilterStatus={setTabCurrentStatus}

                columns={columns}
                rows={displayedCustomers}
                secondlastColumnName="Status"
                lastColumnName="Actions"

                searchBarData={baseFilteredCustomers}
                searchBarSetData={setFilteredCustomers}
                searchBarKey="Name"
                searchBarclassName="h-8 bg-gray-100 border border-gray-100 rounded-md px-2"

                sortDropdownData={baseFilteredCustomers}
                sortDropdownSetData={setFilteredCustomers}
                sortDropdownOptions={sortOptions}

                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredCustomers.length}

                tableHeight="h-[calc(100vh-330px)]"
                isLoading={isLoading}

            >
                {(customer) => (
                    <>
                        <td className="py-3 px-4 flex ">
                            <CustomDropdown
                                id="Status"
                                name="Status"
                                className={statusStyles[customer.Status]}
                                value={customer.Status}
                                disabled={customer.Status === 'Approved' || customer.Status === 'Pending'}
                                onChange={(e) => handleInputChange(e, customer)}
                                placeholder="Select Status"
                                options={
                                    customer.Status === "Approved" || customer.Status === "Pending"
                                        ? allOptions // Show all options
                                        : allOptions.filter(
                                            option => option.value === "Active" || option.value === "Inactive"
                                        )}
                            />
                            {(tabCurrentStatus === 'Pending' || tabCurrentStatus === 'Approved') && (
                                <PlusButton onClick={() => handlePlusButtonClick(customer)} />
                            )}
                        </td>

                        <td className="py-3 px-4">
                            <EditButton onClick={() => handleEditClick(customer)} />
                        </td>
                    </>
                )}
            </Table>

            {
                isModalOpen && (
                    <CustomerCredentialsModal
                        credentials={credentials}
                        onConfirm={handleModalConfirm}
                    />
                )
            }

            {isStatusModalOpen && <ParticipantsStatusModal onCancel={() => setisStatusModalOpen(false)} formData={formData} setformData={setformData} onConfirm={onConfirm} />}
        </>

    );
}
