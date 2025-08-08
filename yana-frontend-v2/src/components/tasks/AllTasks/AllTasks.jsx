import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePaginationController } from "../../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../../util/PaginationFilteredData/PaginatedData.jsx";
import Table from "../../../elements/table/Table";
import EyeIcon from '../../../assets/customIcons/generalIcons/EyeIcon.svg';
import edit from "../../../assets/customIcons/generalIcons/edit.svg";
import tasksMiddleware from "../../../redux/middleware/tasksMiddleware";
import statusStyles from "../../../util/statusStyles/StatusStyles";
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";
import moment from "moment";
import { useDispatch } from "react-redux";

const tabs = [
    { value: 'all', label: 'All', activeClass: 'text-purple-500' },
    { value: 'pending', label: 'Pending', activeClass: 'text-purple-500' },
    { value: 'inprogress', label: 'Inprogress', activeClass: 'text-purple-500' },
    { value: 'completed', label: 'Completed', activeClass: 'text-green' },
];

const StatusBadge = ({ status }) => {
    return (
        <span className={`px-3 py-1 rounded-full text-sm border min-w-[100px] text-center ${statusStyles[status] || statusStyles.default}`}>
            {status}
        </span>
    );
};

export default function AllTasks({ isCreatePermission, isEditPermission }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
    const paginatedTasks = usePaginatedData(allTasks, currentPage, itemsPerPage);
    const [displayTasks, setDisplayTasks] = useState(paginatedTasks);

    const columns = [
        { key: 'task_id', header: 'Task id' },
        { key: 'title', header: 'Title' },
        { key: 'description', header: 'Description' },
        { key: 'user.name', header: 'Created By' },
        { key: 'assignTo.name', header: 'Assigned To' },
        {
            key: 'createdAt',
            header: 'Created Date',
            accessor: (row) => moment(row.createdAt).format("MM-DD-YYYY")
        },
        {
            key: 'status', 
            header: 'Status',
            accessor: (row) => (
                <div className="flex items-center">
                    <StatusBadge status={capitalizeFirstLetter(row?.status)} />
                </div>
            )
        },
        {
            key: 'Actions',
            header: 'Actions',
            accessor: (row) => (
                <div className="flex py-3 gap-2">
                    <button onClick={() => navigate(`/task-details?tab=${tabCurrentStatus}`, { 
                        state: { taskDetails: row, isEditable: false } 
                    })}>
                        <img src={EyeIcon} alt="View" width={18} height={18} />
                    </button>
                    {isEditPermission && (
                        <button onClick={() => navigate(`/task-details?tab=${tabCurrentStatus}`, { 
                            state: { taskDetails: row, isEditable: true } 
                        })}>
                            <img src={edit} alt="View" width={18} height={18} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const sortOptions = [
        { value: 'oldest', label: 'Sort by: Oldest' },
        { value: 'newest', label: 'Sort by: Newest' },
    ];

    useEffect(() => {
        fetchTasks();
    }, [tabCurrentStatus]);

    useEffect(() => {
        setDisplayTasks(paginatedTasks);
    }, [paginatedTasks]);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const payload = { "status": tabCurrentStatus };
            const response = await dispatch(tasksMiddleware.GetAllTasks(payload));
            if (response?.success) {
                setAllTasks(response.tasks || []);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived values
    const totalPages = Math.ceil(allTasks.length / itemsPerPage);

    return (
        <Table
            tableTitle="Tasks"
            columns={columns}
            rows={displayTasks}
            searchBarData={paginatedTasks}
            searchBarSetData={setDisplayTasks}
            sortDropdownData={paginatedTasks}
            sortDropdownSetData={setDisplayTasks}
            sortDropdownOptions={sortOptions}
            tabs={tabs}
            filterStatus={tabCurrentStatus}
            setFilterStatus={setTabCurrentStatus}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={allTasks.length}
            isLoading={isLoading}
        />
    );
}