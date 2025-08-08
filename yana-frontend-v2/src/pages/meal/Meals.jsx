import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/meals/card/Card.jsx';
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import AddMealIcon from '../../assets/customIcons/generalIcons/AddCircle.svg';
import { useDispatch, useSelector } from "react-redux";
import mealsMiddleware from '../../redux/middleware/mealsMiddleware.js';
import Pagination from "../../elements/pagination/Pagination.jsx";
import Spinner from '../../elements/customSpinner/Spinner.jsx';
import SearchBar from '../../elements/searchBar/SearchBar.jsx';
import usePermissionChecker from '../../util/permissionChecker/PermissionChecker.jsx';
import { usePaginationController } from '../../util/PaginationFilteredData/PaginationController.jsx';
import { usePaginatedData } from '../../util/PaginationFilteredData/PaginatedData.jsx';

const searchBarOptions = [
  { key: 'name' },
  { key: 'vendorId.name' }
]

const Meals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Pagination
  const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 8);

  // Data state
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Permissions
  const checkPermission = usePermissionChecker();
  const isEditPermission = checkPermission('meal', 'edit');
  const isDeletePermission = checkPermission('meal', 'delete');
  const canCreateMeal = checkPermission('meal', 'create');

  // Paginated data
  const paginatedMeals = usePaginatedData(meals, currentPage, itemsPerPage);
  const [displayMeals, setDisplayMeals] = useState(paginatedMeals);

  // Data fetching
  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setIsLoading(true);
      const response = await dispatch(mealsMiddleware.GetAllMeals());
      setMeals(response?.meals || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleAddMealClick = () => navigate('/meals/add-meals');
  const handleCardClick = (meal) => {
    navigate(`/meals/details/${meal._id}`, {
      state: { item: meal, isEditPermission }
    });
  };

  // Derived values
  const totalPages = Math.ceil(meals.length / itemsPerPage);

  return (
    <div className='flex flex-col h-full gap-2'>
      {canCreateMeal &&
        <div className="flex justify-end items-center">
          <ButtonWithIcon
            onClick={handleAddMealClick}
            icon={<img src={AddMealIcon} alt="Add Meal" width={24} height={24} />}
            text="Add Meal"
            variant='primary'
          />
        </div>
      }

      <div className="bg-white rounded-2xl p-4 flex flex-col gap-5 font-poppins h-full">
        <div className='flex justify-between'>
          <h2 className="text-2xl font-bold">All Meals</h2>
          <SearchBar
            Data={paginatedMeals}
            setData={setDisplayMeals}
            searchBarOptions={searchBarOptions}
            className="h-8 bg-gray-100 border border-gray-100 rounded-md px-2"
          />
        </div>

        {/* Main content area with proper scrolling */}
        <div className="flex flex-col flex-grow min-h-0 relative">
          {/* Scrollable card grid */}
          <div className="absolute inset-0 overflow-y-auto "> {/* Added padding for pagination */}
            {isLoading ? (
              <div className='h-full flex items-center justify-center'>
                <Spinner />
              </div>
            ) : displayMeals.length > 0 ? (
              <div className="grid grid-cols-1 px-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {displayMeals.map((meal) => (
                  <Card
                    key={meal._id}
                    isEditPermission={isEditPermission}
                    isDeletePermission={isDeletePermission}
                    showToggle={true}
                    fetchMeals={fetchMeals}
                    onClick={() => handleCardClick(meal)}
                    meal={meal}
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

        {/* Sticky pagination - matches Table component style */}
        {!isLoading && displayMeals.length > 0 && (
          <div className="sticky bottom-0 bg-white z-10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={meals.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Meals;