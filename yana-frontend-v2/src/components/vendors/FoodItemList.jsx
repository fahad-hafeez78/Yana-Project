import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useLocation } from "react-router-dom";
import FoodItemCard from "./FoodItemCard.jsx";
import SortDropdown from "../../elements/sortDropdown/SortDropdown.jsx";
import mealsMiddleware from '../../redux/middleware/mealsMiddleware.js';
import Pagination from "../../elements/pagination/Pagination.jsx"; // Import the Pagination component
import Spinner from "../../elements/customSpinner/Spinner.jsx"; // Import the Spinner component

const FoodItemList = () => {
  const dispatch = useDispatch();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading
  const { id } = useParams();
  const location = useLocation();
  const VendorID = id;
  const vendorName = location.state?.vendorName || `Vendor ${VendorID}`;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Adjust as needed
  const totalPages = Math.ceil(meals?.length / itemsPerPage);

  // Pagination: Slice the meals array based on current page
  const displayFoodItems = meals?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await dispatch(mealsMiddleware.GetMealsByVendorId(VendorID));
        if (response.success) {
          setMeals(response?.meals);
        } else {
          console.error("Error Fetching Meals");
        }
      } catch (error) {
        console.error("Error Fetching Meals:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchMeals();
  }, []);

  // Filter the food items by VendorID
  // const filteredFoodItems = meals?.filter(item => item.VendorID === VendorID);

  return (
  <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">{vendorName}</h1>
      <div>
        <SortDropdown 
          Data={meals} 
          setData={setMeals} 
          options={[
            { value: 'oldest', label: 'Sort by: Oldest' },
            { value: 'newest', label: 'Sort by: Newest' },
          ]} 
        />
      </div>
    </div>

    <div className="flex flex-col flex-grow min-h-0">
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Scrollable content area */}
          <div className="flex-grow overflow-y-auto">
            {meals?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayFoodItems?.map(item => (
                  <FoodItemCard key={item._id} item={item}/>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-full'>
                <img
                  src="/No data found.jpg"
                  alt="No data found"
                  className="max-h-[220px] object-contain"
                />
                <p className="text-gray mt-4">No meals found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {meals?.length > 0 && (
            <div className="sticky bottom-0 bg-white pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={meals?.length}
              />
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
};

export default FoodItemList;
