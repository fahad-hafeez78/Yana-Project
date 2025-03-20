import { useState, useEffect } from 'react';
import Table from '../../../elements/table/Table';
import { useDispatch } from 'react-redux';
import customersMiddleware from '../../../redux/middleware/customersMiddleware';
import ParticipantsChangesModal from '../participantsChangesModal/ParticipantsChangesModal';
import EyeIcon from '../../../assets/customIcons/generalIcons/EyeIcon.svg';

const columns = [
    { key: 'participantId.Name', header: 'Name' },
    { key: 'participantId.Status', header: 'Status' },
    { key: 'participantId.MedicaidID', header: 'Medical Id' },
    { key: 'participantId.MemberID', header: 'Member Id' },
];

export default function ParticipantsChangesTable() {
    const dispatch = useDispatch()

    const [activeCustomers, setActiveCustomers] = useState([]);
    const [isModalOpen, setisModalOpen] = useState(false);  // Modal state
    const [singleCustomer, setsingleCustomer] = useState([]);
    const [isLoading, setisLoading] = useState(true);

    const itemsPerPage = 100;
    const [currentPage, setCurrentPage] = useState(1);


    const totalPages = Math.ceil(activeCustomers.length / itemsPerPage);
    const displayedCustomers = activeCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await dispatch(customersMiddleware.GetCustomersChanges());
                setActiveCustomers(response.data)
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
            finally {
                setisLoading(false); // Hide spinner
            }
        };

        fetchCustomers();
    }, [dispatch]);

    const handleModalClick = () => {
        setisModalOpen(!isModalOpen);  // Open Delete modal
    };


    return (
        <>

            <Table
                tableTitle="Participants Changes"
                columns={columns}
                rows={displayedCustomers}

                lastColumnName="Update"

                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={activeCustomers.length}

                tableHeight="h-[calc(100vh-300px)]"
                isLoading={isLoading}

            >
                {(participant) => (
                    <>
                        {/* <td className="py-3 px-4 flex items-center">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setsingleCustomer(customer)
                                    handleModalClick()

                                }}
                                className="px-2 py-[3px] bg-[#fe8c00] text-white rounded-full min-w-[80px] text-center space-x-2">
                                <span>See</span>
                            </button>
                        </td> */}
                        <td className="py-3 px-4 flex items-center">
                            <button onClick={(e) => {
                                    e.preventDefault();
                                    setsingleCustomer(participant)
                                    handleModalClick()

                                }}>
                                <img src={EyeIcon} alt="View" width={18} height={18} />
                            </button>
                        </td>

                    </>
                )}
            </Table>

            {isModalOpen && (
                <ParticipantsChangesModal
                    // onConfirm={handleApproveCustomer}
                    onCancel={handleModalClick}
                    customer={singleCustomer}
                />
            )}
        </>
    );
}
