import { useState, useEffect } from "react";
import EyeIcon from '../../../assets/customIcons/generalIcons/EyeIcon.svg';
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown.jsx";
import ParticipantsStatusModal from "../../../components/participants/participantsStatusModal/ParticipantsStatusModal.jsx";
import statusStyles from "../../../util/statusStyles/StatusStyles.js";

import Table from "../../../elements/table/Table";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'
import customersMiddleware from "../../../redux/middleware/customersMiddleware";
import ordersMiddleware from "../../../redux/middleware/ordersMiddleware"

export default function ParticipantsTable() {

    const navigate = useNavigate();
    const dispatch = useDispatch()

    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user?.Role

    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setisLoading] = useState(true);

    const [isModalOpen, setisModalOpen] = useState(false);
    const [isDataUpdated, setisDataUpdated] = useState(false);

    const [formData, setformData] = useState();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;
    const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

    const displayedData = filteredData?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    let columns, title, subtitle;  // Declare columns outside the condition

    if (userRole === "Vendor") {
        columns = [
            { key: 'CustomerName', header: 'Customer Name' },
            { key: 'OrderInstructions', header: 'Order Instructions' },
            { key: 'OrderCost', header: 'Order Cost' },
        ];
        title = "Orders";
        subtitle = "Active Orders"
    } else {
        columns = [
            { key: 'Name', header: 'Participant Name' },
            { key: 'MemberID', header: 'MemberID' },
            { key: 'Phone', header: 'Phone Number' },
            { key: 'coordinatorName', header: 'Coordinator Name' },
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
        title = "All Participants";
        subtitle = "Active Members"
    }

    const sortOptions = [
        { value: 'oldest', label: 'Sort by: Oldest' },
        { value: 'newest', label: 'Sort by: Newest' },
    ];

    const handleDetailsClick = (member) => {
        navigate('/dashboard/participants-details', { state: { memberData: member } });
    };

    const handleInputChange = (e, customer) => {
        const { value } = e.target;

        if (value === 'Inactive') {
            setformData({
                ...customer,
                CustomerID: customer._id, // Append all customer data to formData
                Status: value, // Update the status in formData
            });
            setisModalOpen(true); // Open the modal for confirmation
        }
    };

    const onConfirm = async (data) => {

        try {
            const response = await dispatch(customersMiddleware.UpdateCustomer(formData.CustomerID, data));
            if (response.success){
                setisDataUpdated(true)
            }
        } catch (error) {
            console.error("Error updating customer:", error);
        }
        setisModalOpen(false);
    };


    useEffect(() => {

        const fetchData = async () => {
            // setisLoading(true);
            try {
                if (userRole === "Vendor") {
                    // Fetch orders if the user is a Vendor
                    const response = await dispatch(ordersMiddleware.GetAllOrders()); // Replace with correct action
                    const activeOnly = response?.data.filter(order => order.Status === "Active"); // Adjust as needed
                    setFilteredData(activeOnly);
                    setData(activeOnly);
                } else {
                    // Fetch customers if the user is not a Vendor
                    const response = await dispatch(customersMiddleware.GetAllActiveCustomers());
                    setFilteredData(response.data);
                    setData(response.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            finally {
                setisLoading(false); // Hide spinner
                setisDataUpdated(false)
            }
        };

        fetchData();
    }, [dispatch, userRole, isDataUpdated]); // Dependency array includes `userRole` so it re-runs when the role changes

    return (
        <>
            <Table
                tableTitle={title}
                tableSubTitle={subtitle}

                columns={columns}
                rows={displayedData}

                secondlastColumnName="Status"
                lastColumnName="Details"

                searchBarData={data}
                searchBarSetData={setFilteredData}
                searchBarKey="Name"
                searchBarclassName='h-8 bg-gray-100 border border-gray-100 rounded-md px-2'

                sortDropdownData={data}
                sortDropdownSetData={setFilteredData}
                sortDropdownOptions={sortOptions}

                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredData?.length}

                tableHeight="h-[calc(100vh-362px)]"
                isLoading={isLoading}

            >
                {(participant) => (
                    <>
                        <td className="py-3 px-4 flex items-center ">
                            <CustomDropdown
                                id="Status"
                                name="Status"
                                className={statusStyles[participant.Status]}
                                value={participant.Status}
                                onChange={(e) => handleInputChange(e, participant)}
                                placeholder="Select Status"
                                options={[
                                    { value: "Active", label: "Active" },
                                    { value: "Inactive", label: "Inactive" },
                                ]}
                            />
                        </td>

                        <td className=" py-3 px-5">
                            <button onClick={() => handleDetailsClick(participant)}>
                                <img src={EyeIcon} alt="View" width={18} height={18} />
                            </button>
                        </td>
                    </>
                )}

            </Table>
            {isModalOpen && <ParticipantsStatusModal onCancel={() => setisModalOpen(false)} formData={formData} onConfirm={onConfirm} />}
        </>
    )
}