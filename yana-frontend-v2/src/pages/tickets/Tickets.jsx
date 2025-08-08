import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { usePaginationController } from "../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../util/PaginationFilteredData/PaginatedData.jsx";
import { emitSocketEvent, getSocket, offSocketEvent, onSocketEvent } from "../../config/webSocket";
import Table from "../../elements/table/Table";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';
import InprogressTicketIcon from '../../assets/customIcons/ticketIcons/InprogressTicketIcon.svg';
import PendingTicketIcon from '../../assets/customIcons/ticketIcons/PendingTicketIcon.svg';
import moment from "moment";
import statusStyles from "../../util/statusStyles/StatusStyles";
import capitalizeFirstLetter from "../../util/capitalizeFirstLetter/CapitalizeFirstLetter";

const sortOptions = [
    { value: 'oldest', label: 'Sort by: Oldest' },
    { value: 'newest', label: 'Sort by: Newest' },
];

const allTabs = [
    { value: 'all', label: 'All', activeClass: 'text-purple-500' },
    { value: 'pending', label: 'Pending', activeClass: 'text-purple-500' },
    { value: 'inprogress', label: 'Inprogress', activeClass: 'text-purple-500' },
    { value: 'solved', label: 'Solved', activeClass: 'text-green' },
];

export default function Tickets() {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.user);
    const socket = getSocket();

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Tab state with search params
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabCurrentStatus, setTabCurrentStatus] = useState(searchParams.get('tab') || 'all');
    const tabCurrentStatusRef = useRef(tabCurrentStatus);

    // Filter tabs based on user role
    const visibleTabs = user?.organization?.name === "admin-organization"
        ? allTabs
        : allTabs.filter(tab => tab.value !== 'pending');

    // Paginated data
    const paginatedTickets = usePaginatedData(tickets, currentPage, itemsPerPage);
    const [displayTickets, setDisplayTickets] = useState(paginatedTickets);

    const columns = [
        {
            key: 'ticket_id',
            header: 'Ticket Id',
            accessor: (row) => (
                row?.unreadMessagesCount === 0 ?
                    <span>{row.ticket_id}</span>
                    :
                    <div className="flex gap-3 ">
                        <span>{row.ticket_id}</span>
                        <div className="flex items-center justify-end">
                            <span className="flex bg-secondary-dark text-white text-xs px-1.5 rounded-full border border-white">
                                {row?.unreadMessagesCount}
                            </span>
                        </div>
                    </div>
            ),
        },
        {
            key: 'title',
            header: 'Title',
            accessor: (row) => <span>{row?.title}</span>,
        },
        { key: 'description', header: 'Description' },
        { key: 'category', header: 'Category' },
        { key: 'assignTo.name', header: 'Assign To' },
        {
            key: 'createdAt',
            header: 'Created Date',
            accessor: (row) => moment(row?.createdAt).format('MM-DD-YYYY'),
        },
        { key: 'user.vendorId.name', header: 'Participant Vendor' },
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
            key: 'actions',
            header: 'Actions',
            accessor: (row) => (
                <div className="py-3 px-5">
                    <button onClick={() => handleTicketDetails(row)}>
                        {row?.status === 'solved' ?
                            <img src={EyeIcon} alt="View" width={18} height={18} /> :
                            row?.status === 'pending' ?
                                <img src={PendingTicketIcon} alt="View" width={18} height={18} /> :
                                <img src={InprogressTicketIcon} alt="View" width={18} height={18} />
                        }
                    </button>
                </div>
            ),
        },
    ];

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== tabCurrentStatus) {
            setTabCurrentStatus(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        tabCurrentStatusRef.current = tabCurrentStatus;
    }, [tabCurrentStatus]);

    useEffect(() => {
        const params = {};
        if (tabCurrentStatus !== 'all') params.tab = tabCurrentStatus;
        if (currentPage !== 1) params.page = currentPage;
        
        setSearchParams(params);
    }, [tabCurrentStatus, currentPage]);

    const emitAllTickets = () => {
        setIsLoading(true);
        const body = { status: tabCurrentStatusRef.current };
        emitSocketEvent('allTickets', body);
    };

    useEffect(() => {
        const newTicketHandler = (ticket) => {
            setTickets(prev => [...prev, ticket]);
        };

        onSocketEvent('newTicketBroadcast', newTicketHandler);

        return () => {
            offSocketEvent('newTicketBroadcast', newTicketHandler);
        };
    }, []);

    useEffect(() => {
        const newMessageHandler = () => {
            emitAllTickets();
        };

        onSocketEvent('newTicketMessage', newMessageHandler);

        return () => {
            offSocketEvent('newTicketMessage', newMessageHandler);
        };
    }, []);

    useEffect(() => {
        if (socket) emitAllTickets();
    }, [tabCurrentStatus, socket]);

    useEffect(() => {
        const handleAllTickets = (tickets) => {
            setTickets(tickets || []);
            setIsLoading(false);
        };

        onSocketEvent('allTickets', handleAllTickets);

        return () => {
            offSocketEvent('allTickets', handleAllTickets);
        };
    }, [socket]);

    useEffect(() => {
        setDisplayTickets(paginatedTickets);
    }, [paginatedTickets]);

    const handleTicketDetails = (ticket) => {
        navigate('/tickets/ticket-details', { state: { ticketDetail: ticket } });
    };

    // Derived values
    const totalPages = Math.ceil(tickets.length / itemsPerPage);

    return (
        <Table
            tableTitle="Tickets"
            columns={columns}
            rows={displayTickets}
            tabs={visibleTabs}
            filterStatus={tabCurrentStatus}
            setFilterStatus={setTabCurrentStatus}
            searchBarData={paginatedTickets}
            searchBarSetData={setDisplayTickets}
            sortDropdownData={paginatedTickets}
            sortDropdownSetData={setDisplayTickets}
            sortDropdownOptions={sortOptions}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={tickets.length}
        />
    );
}