import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import VendorCard from "../../components/vendors/VendorCard.jsx";
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import AddCircle from "../../assets/Icons/AddCircle.svg";
import SortDropdown from "../../elements/sortDropdown/SortDropdown.jsx";
import { useDispatch } from "react-redux";
import vendorsMiddleware from "../../redux/middleware/vendorsMiddleware.js";
import * as XLSX from 'xlsx';
import { showErrorAlert } from "../../redux/actions/alertActions.js";
import Pagination from "../../elements/pagination/Pagination.jsx";
import Spinner from '../../elements/customSpinner/Spinner.jsx'; // Import Spinner

const VendorList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for vendors

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allVendors.length / itemsPerPage);
  const displayVendors = allVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sortOptions = [
    { value: 'oldest', label: 'Sort by: Oldest' },
    { value: 'newest', label: 'Sort by: Newest' },
  ];

  const handleDownload = () => {
    if (allVendors.length === 0) {
      dispatch(showErrorAlert("No data available for download."));
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(allVendors);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");
    XLSX.writeFile(workbook, "VendorsDataFile.xlsx");
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await dispatch(vendorsMiddleware.GetAllVendors());
        if (response.success) {
          setAllVendors(response.data);
        } else {
          console.error("Error Fetching Vendors");
        }
      } catch (error) {
        console.error("Error Fetching Vendors:", error);
      } finally {
        setLoading(false); // Set loading to false after data fetch
      }
    };

    fetchVendors();
  }, [dispatch]);

  return (
    <>
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <ButtonWithIcon
            onClick={() => navigate('addvendor')}
            icon={<img src={AddCircle} className='w-5 h-5' alt="Add Circle Icon" />}
            text="Add Vendor"
            className="bg-custom-blue text-white px-3 py-2 rounded-full"
          />
          <ButtonWithIcon
            onClick={handleDownload}
            icon={<img src={AddCircle} className='w-5 h-5' alt="Add Circle Icon" />}
            text="Download"
            className="bg-red-600 text-white px-3 py-2 rounded-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 font-poppins">
        <div className="grid container mx-auto gap-5">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">All Vendors</h2>
            <SortDropdown Data={allVendors} setData={setAllVendors} options={sortOptions} />
          </div>
          {loading ? (
            <Spinner /> // Show spinner while loading
          ) : allVendors.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 overflow-y-auto px-2 h-[calc(100vh-300px)]">
              {displayVendors?.map((vendor) => (
                <VendorCard key={vendor._id.toString()} vendor={vendor} />
              ))}
            </div>
          ) : (
            <div className='flex flex-col h-[calc(100vh-250px)] items-center align-center p-6'>
              <img
                src="/No data found.jpg"
                alt="No data found"
                className={`mx-auto max-h-[220px] object-contain`}
              />
            </div>
          )}
        </div>

        {allVendors.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={allVendors.length}
          />
        )}
      </div>
    </>
  );
};

export default VendorList;
