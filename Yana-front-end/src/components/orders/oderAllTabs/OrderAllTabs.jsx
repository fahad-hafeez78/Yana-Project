import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EyeIcon from '../../../assets/customIcons/generalIcons/EyeIcon.svg';
import EditIcon from '../../../assets/Check-Mark.svg';
import Table from "../../../elements/table/Table";
import statusStyles from "../../../util/statusStyles/StatusStyles";

export default function OrderAllTab(
    {
        allOrders, 
        filteredOrders, 
        setFilteredOrders,
        baseFilteredOrders, 
        setBaseFilteredOrders,
        isLoading, 
    }
) {
    
    const navigate = useNavigate();

    const [tabCurrentStatus, setTabCurrentStatus] = useState('All');

    const itemsPerPage = 100;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(filteredOrders?.length / itemsPerPage);
    const displayOrders = filteredOrders?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    const columns = [
        { key: 'participantName', header: 'Participant Name' },
        { key: 'OrderUnits', header: 'Order Units' },
        { key: 'OrderPlaceDateTime', header: 'Order Date' },
    ];

    const StatusBadge = ({ status }) => {
        return (
            <span className={`px-3 py-1 rounded-full text-sm border min-w-[100px] text-center ${statusStyles[status] || statusStyles.default}`}>
                {status}
            </span>
        );
    };

    const tabs = [
        { value: 'All', label: 'All', activeClass: 'text-purple-500' },
        { value: 'Active', label: 'Active', activeClass: 'text-green-500' },
        { value: 'Pending', label: 'Pending', activeClass: 'text-yellow-500' },
        { value: 'Completed', label: 'Completed', activeClass: 'text-custom-blue ' },
        { value: 'Disputed', label: 'Disputed', activeClass: 'text-red-500 ' },
    ];


    const sortOptions = [
        { value: 'oldest', label: 'Sort by: Oldest' },
        { value: 'newest', label: 'Sort by: Newest' },
        { value: 'asc', label: 'Sort by: Cost (Ascend)' },
        { value: 'des', label: 'Sort by: Cost (Descend)' },
    ];

    const handleDetailsIconClick = (orderdata, isEditable) => {
        navigate('/orders/details', { state: { OrderData: orderdata, isEditable } });
    }

    useEffect(() => {
        const filterByStatus = () => {
            const filtered = tabCurrentStatus === 'All'
                ? allOrders
                : allOrders?.filter(order => order.Status.toLowerCase() === tabCurrentStatus.toLowerCase());

            setFilteredOrders(filtered);
            setBaseFilteredOrders(filtered);
            setCurrentPage(1);
        };
        filterByStatus();
    }, [tabCurrentStatus, allOrders]);

    const processedOrders = displayOrders?.map(order => ({
        ...order,
        OrderPlaceDateTime: formatDate(order.OrderPlaceDateTime),
    }));

    return (
        <>
            <Table
                tableTitle="Orders"

                tabs={tabs}
                filterStatus={tabCurrentStatus}
                setFilterStatus={setTabCurrentStatus}

                columns={columns}
                rows={processedOrders}
                secondlastColumnName="Status"
                lastColumnName={tabCurrentStatus === "Pending" ? "Actions" : "Details"}

                searchBarData={baseFilteredOrders}
                searchBarSetData={setFilteredOrders}
                searchBarKey="participantName"
                searchBarclassName="h-8 bg-gray-100 border border-gray-100 rounded-md px-2"

                sortDropdownData={baseFilteredOrders}
                sortDropdownSetData={setFilteredOrders}
                sortDropdownOptions={sortOptions}

                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredOrders?.length}

                tableHeight="h-[calc(100vh-330px)]"
                isLoading={isLoading}
            >
                {(order) => (
                    <>
                        <td className="py-4 px-4 flex items-center">
                            <StatusBadge status={order.Status} />
                        </td>

                        {tabCurrentStatus === 'Pending' || tabCurrentStatus === 'Active' ? (
                            <td className="py-3 px-5 ">
                                <button onClick={() => handleDetailsIconClick(order, true)} className="px-2 py-[3px] flex items-center bg-[#fe8c00] text-white rounded-full space-x-2">
                                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                                    <span>Edit</span>
                                </button>
                            </td>
                        ) : (
                            <td className="py-3 px-5">
                                <button onClick={() => handleDetailsIconClick(order, false)} >
                                    {/* <img src={DetailsIcon} alt="View" width={18} height={18} /> */}
                                    <img src={EyeIcon} alt="View" width={18} height={18} />
                                </button>
                            </td>
                        )}
                    </>
                )}
            </Table>
        </>
    );
}
