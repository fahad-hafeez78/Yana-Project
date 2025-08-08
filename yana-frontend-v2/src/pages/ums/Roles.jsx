import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { usePaginationController } from "../../util/PaginationFilteredData/PaginationController.jsx";
import RoleCard from "../../components/ums/Roles/RoleCard";
import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon";
import Spinner from "../../elements/customSpinner/Spinner";
import roleMiddleware from "../../redux/middleware/roleMiddleware";
import importfile from "../../assets/customIcons/generalIcons/import file.svg";
import SearchBar from "../../elements/searchBar/SearchBar";
import SortDropdown from "../../elements/sortDropdown/SortDropdown";
import Pagination from "../../elements/pagination/Pagination";
import { usePaginatedData } from "../../util/PaginationFilteredData/PaginatedData.jsx";

const searchBarOptions = [
    { key: 'name' },
    { key: 'description' },
    { key: 'parentUser.name' },
    { key: 'userCounts' },
];

const sortOptions = [
    { value: 'oldest', label: 'Sort by: Oldest' },
    { value: 'newest', label: 'Sort by: Newest' },
];

export default function Roles() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 6);

    // Data state
    const [allRoles, setAllRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Paginated data
    const paginatedRoles = usePaginatedData(allRoles, currentPage, itemsPerPage);
    const [displayRoles, setDisplayRoles] = useState(paginatedRoles);

    useEffect(() => {
        fetchAllRoles();
    }, []);

    useEffect(() => {
        setDisplayRoles(paginatedRoles);
    }, [paginatedRoles]);

    const fetchAllRoles = async () => {
        setIsLoading(true);
        try {
            const response = await dispatch(roleMiddleware.GetAllRoles());
            const filteredRoles = response?.roles?.filter(role => role?.name !== 'admin') || [];
            setAllRoles(filteredRoles);
        } catch (error) {
            console.error("Error fetching roles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived values
    const totalPages = Math.ceil(allRoles.length / itemsPerPage);

    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="flex justify-end items-center">
                <ButtonWithIcon
                    onClick={() => navigate("create-role")}
                    icon={<img src={importfile} alt="import file" width={18} height={18} />}
                    text="Create Role"
                    variant='primary'
                />
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col gap-5 font-poppins h-full">
                <div className="flex justify-between">
                    <h2 className="text-2xl font-bold">Roles</h2>
                    <div className="flex gap-2">
                        <SearchBar
                            Data={paginatedRoles}
                            setData={setDisplayRoles}
                            searchBarOptions={searchBarOptions}
                            className="h-8 bg-gray-100 border border-gray-100 rounded-md px-2"
                        />
                        <SortDropdown
                            Data={paginatedRoles}
                            setData={setDisplayRoles}
                            options={sortOptions}
                        />
                    </div>
                </div>

                {/* Main content area with scrolling */}
                <div className="flex flex-col flex-grow min-h-0 relative">
                    {/* Scrollable roles grid */}
                    <div className="absolute inset-0 overflow-y-auto">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Spinner />
                            </div>
                        ) : displayRoles?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {displayRoles.map((role) => (
                                    <RoleCard
                                        key={role?._id}
                                        role={role}
                                        fetchAllRoles={fetchAllRoles}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-6">
                                <img
                                    src="/No data found.jpg"
                                    alt="No data found"
                                    className="mx-auto max-h-[220px] object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky pagination */}
                {allRoles.length > 0 && (
                    <div className="sticky bottom-0 bg-white z-10">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={allRoles.length}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}