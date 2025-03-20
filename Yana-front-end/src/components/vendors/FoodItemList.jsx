import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useLocation } from "react-router-dom";
import FoodItemCard from "./FoodItemCard.jsx";
import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon.jsx";
import AddCircle from "../../assets/Icons/AddCircle.svg";
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
  const totalPages = Math.ceil(meals.length / itemsPerPage);

  // Pagination: Slice the meals array based on current page
  const displayFoodItems = meals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await dispatch(mealsMiddleware.GetAllMeals());
        if (response.success) {
          setMeals(response.data);
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
  }, [dispatch]);

  // Filter the food items by VendorID
  const filteredFoodItems = meals.filter(item => item.vendorId === VendorID);

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 font-poppins">
        <div className="flex justify-between">
          <h2 className="text-2xl text-yana-navy font-semibold mb-4">{vendorName}</h2>
          <SortDropdown Data={meals} setData={setMeals} options={[
            { value: 'oldest', label: 'Sort by: Oldest' },
            { value: 'newest', label: 'Sort by: Newest' },
          ]} />
        </div>

        {/* Display spinner if loading */}
        {loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-230px)]">
            <Spinner />
          </div>
        ) : (
          // Display food items if not loading
          <div>
            {filteredFoodItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 py-2 gap-6 overflow-y-auto h-[calc(100vh-230px)]">
                  {displayFoodItems.map(item => (
                    <FoodItemCard key={item._id} item={item} vendorName={vendorName} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredFoodItems.length}
                />
              </>
            ) : (
              <div className='flex flex-col items-center justify-center h-[calc(100vh-190px)]'>
                <img
                  src="/No data found.jpg" // Use the relative path from the public folder
                  alt="No data found"
                  className="mx-auto max-h-[220px] object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodItemList;
