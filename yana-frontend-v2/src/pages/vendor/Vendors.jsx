import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import VendorCard from "../../components/vendors/VendorCard.jsx";
import SortDropdown from "../../elements/sortDropdown/SortDropdown.jsx";
import vendorsMiddleware from "../../redux/middleware/vendorsMiddleware.js";
import Pagination from "../../elements/pagination/Pagination.jsx";
import Spinner from '../../elements/customSpinner/Spinner.jsx';
import SearchBar from "../../elements/searchBar/SearchBar.jsx";
import usePermissionChecker from "../../util/permissionChecker/PermissionChecker.jsx";
import { usePaginationController } from "../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../util/PaginationFilteredData/PaginatedData.jsx";

const searchBarOptions = [
  { key: 'name' },
  { key: 'phone' },
  { key: 'unified_user.email' },
  { key: 'address.city' },
  { key: 'address.state' },
  { key: 'address.street1' },
  { key: 'address.street2' },
  { key: 'address.zip' },
];

const sortOptions = [
  { value: 'oldest', label: 'Sort by: Oldest' },
  { value: 'newest', label: 'Sort by: Newest' },
];

const VendorList = () => {
  const dispatch = useDispatch();
  
  // Pagination
  const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 6);

  // Data state
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Permissions
  const checkPermission = usePermissionChecker();
  const isEditPermission = checkPermission('vendor', 'edit');
  const isDeletePermission = checkPermission('vendor', 'delete');

  // Paginated data
  const paginatedVendors = usePaginatedData(vendors, currentPage, itemsPerPage);
  const [displayVendors, setDisplayVendors] = useState(paginatedVendors);

  // Data fetching
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await dispatch(vendorsMiddleware.GetAllVendors("all"));
      if (response.success) {
        setVendors(response?.vendors || []);
      }
    } catch (error) {
      console.error("Error Fetching Vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Derived values
  const totalPages = Math.ceil(vendors.length / itemsPerPage);

  if (loading) {
    return <div className="bg-white p-5 rounded-2xl h-full flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 font-poppins h-full">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">All Vendors</h2>
          <div className="flex gap-2">
            <SearchBar
              Data={paginatedVendors}
              setData={setDisplayVendors}
              searchBarOptions={searchBarOptions}
              className="h-8 bg-gray-100 border border-gray-100 rounded-md px-2"
            />
            <SortDropdown 
              Data={paginatedVendors} 
              setData={setDisplayVendors} 
              options={sortOptions} 
            />
          </div>
        </div>

        {/* Main content area with scrolling */}
        <div className="flex flex-col flex-grow min-h-0 relative">
          {/* Scrollable vendor cards */}
          <div className="absolute inset-0 overflow-y-auto">
            {displayVendors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 px-2">
                {displayVendors.map((vendor) => (
                  <VendorCard 
                    key={vendor._id} 
                    fetchVendors={fetchVendors} 
                    vendor={vendor} 
                    isEditPermission={isEditPermission} 
                    isDeletePermission={isDeletePermission} 
                  />
                ))}
              </div>
            ) : (
              <div className='h-full flex flex-col items-center justify-center p-6'>
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
        {vendors.length > 0 && (
          <div className="sticky bottom-0 bg-white">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={vendors.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorList;