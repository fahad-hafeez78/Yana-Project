import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/meals/card/Card.jsx';
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import AddMealIcon from '../../assets/plus-circle-white.svg';
import { useDispatch, useSelector } from "react-redux";
import mealsMiddleware from '../../redux/middleware/mealsMiddleware.js';
import Pagination from "../../elements/pagination/Pagination.jsx"; // Import the Pagination component
import Spinner from '../../elements/customSpinner/Spinner.jsx';

const Meals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user)

  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const itemsPerPage = 12; // Adjust the number of items per page as needed
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(meals.length / itemsPerPage);
  const displayMeals = meals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await dispatch(mealsMiddleware.GetAllMeals());
        switch (user.Role) {
          case "Vendor":
            const filteredMeals = response?.data?.filter((meal) => meal.VendorID === user._id);
            setMeals(filteredMeals);
            break;

          default:
            setMeals(response.data);
            break;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching meals:", error);
      }
    };

    fetchMeals();
  }, []);


  const handleAddMealClick = () => {
    navigate('/meals/addmeals');
  };

  const handleCardClick = (meal) => {
    navigate(`/meals/details/${meal._id}`, { state: { item: meal } });
  };

  return (
    // <div>
    <>
      <div className="flex justify-end items-center ">
        {/* <h1 className="font-semibold text-xl">All Meals</h1> */}
        <ButtonWithIcon
          onClick={handleAddMealClick}
          icon={<img src={AddMealIcon} alt="Add Meal" width={24} height={24} />}
          text="Add Meal"
          className="bg-custom-blue text-white px-3 py-2 rounded-full"
        />
      </div>
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-5 font-poppins">

        <h2 className="text-2xl font-bold">All Meals</h2>


        {isLoading ? (
          <div className='h-[calc(100vh-300px)'>
            <Spinner />
          </div>

        ) : displayMeals.length > 0 ? (

          <div className="grid grid-cols-1 px-2 sm:grid-cols-2 lg:grid-cols-4 w-[100%] gap-5 overflow-auto h-[calc(100vh-300px)]">
            {
              displayMeals.map((meal) => (
                <Card
                  key={meal._id.toString()}
                  name={meal.title}
                  imgPath={meal.image}
                  desText={meal.description}
                  showToggle={true}
                  onClick={() => handleCardClick(meal)}
                  meal={meal}
                />
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


        {!isLoading && displayMeals.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={meals.length}
          />
        )}
      </div>
      {/* // </div> */}
    </>
  );
};

export default Meals;
