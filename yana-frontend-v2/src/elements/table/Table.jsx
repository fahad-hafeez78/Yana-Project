import Pagination from "../pagination/Pagination";
import SearchBar from "../searchBar/SearchBar";
import SortDropdown from "../sortDropdown/SortDropdown";
import Tabs from "../tabs/Tabs";
import Spinner from "../customSpinner/Spinner";

export default function Table({
    tableTitle,
    tableSubTitle,

    columns,
    rows,

    searchBarData,
    searchBarSetData,
    searchBarOptions,
    searchBarclassName,

    sortDropdownData,
    sortDropdownSetData,
    sortDropdownOptions,

    tabs,
    filterStatus,
    setFilterStatus,

    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,

    isLoading,

    selectedRows,
    handleSelectRow,
    handleSelectAll,
}) {

    const getNestedValue = (obj, key) => {
        return key.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    return (
        <div className={`bg-white rounded-2xl py-4 flex flex-col "w-full h-full`}>
            {/* Header section - fixed height */}
            <div className="flex-shrink-0 px-3">
                <div className="flex justify-between items-center mb-4">
                    <div className="htext">
                        <h2 className="text-2xl font-semibold">{tableTitle}</h2>
                        {tableSubTitle && (<h5 className="text-green font-medium">{tableSubTitle}</h5>)}
                        {tabs &&
                            <div className="mt-4">
                                <Tabs tabs={tabs} activeTab={filterStatus} onTabChange={setFilterStatus} />
                            </div>}
                    </div>

                    <div className="flex items-center space-x-4">
                        {searchBarData && <SearchBar Data={searchBarData} setData={searchBarSetData} searchBarOptions={columns} className={searchBarclassName} />}
                        {sortDropdownData && <SortDropdown Data={sortDropdownData} setData={sortDropdownSetData} options={sortDropdownOptions} />}
                    </div>
                </div>
            </div>

            {/* Main content area with scrolling */}
            <div className="flex flex-col flex-grow min-h-0 relative">
                {/* Horizontal scrolling container */}
                <div className="absolute inset-0 overflow-x-auto">
                    {/* Vertical scrolling container */}
                    <div className="h-full overflow-y-auto">
                        {/* Table with sticky header */}
                        <table className="min-w-full">
                            <thead>
                                <tr className="sticky top-0 z-10 shadow-sm">
                                    {(handleSelectRow && rows?.length > 0) && (
                                        <th className="text-left min-w-[40px] px-4 sticky top-0 bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows?.length === rows?.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                    )}
                                    {columns?.map((column) => (
                                        <th
                                            key={column.key}
                                            className="px-4 text-left text-gray font-medium py-2 whitespace-nowrap sticky top-0 bg-gray-50"
                                        >
                                            {column.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center py-10">
                                            <Spinner />
                                        </td>
                                    </tr>
                                ) : rows && rows.length > 0 ? (
                                    rows.map((row, index) => (
                                        <tr key={index}>
                                            {handleSelectRow && (
                                                <td className="text-left px-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(row._id)}
                                                        onChange={() => handleSelectRow(row._id)}
                                                    />
                                                </td>
                                            )}
                                            {columns.map((column) => (
                                                <td
                                                    key={column.key}
                                                    className="px-4 py-1 text-left whitespace-nowrap overflow-hidden text-ellipsis pr-2 min-w-[140px] max-w-[200px]"
                                                >
                                                    {typeof column.accessor === 'function'
                                                        ? column.accessor(row)
                                                        : getNestedValue(row, column.key) ?? "N/A"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="text-center py-10 text-gray"
                                        >
                                            <img
                                                src="/No data found.jpg"
                                                alt="No data found"
                                                className="mx-auto max-h-[220px] object-contain"
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Sticky pagination */}

            {totalItems > 0 && (
                <div className="sticky bottom-0 bg-white pt-3 z-10 px-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                    />
                </div>
            )}

        </div>
    );
}