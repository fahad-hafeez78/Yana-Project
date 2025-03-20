import React, { useEffect, useState } from 'react';
import StarIcon from "../../../assets/Icons/star.svg";
import TrashIcon from "../../../assets/trash.svg";
import MealsDeleteModal from "../mealsDeleteModal/MealsDeleteModal"
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware';
import { useDispatch } from 'react-redux';


function Card(props) {
  const Meal = props.meal || {};
  const [itemStatus, setItemStatus] = useState(Meal.status || "Available");
  const [isMealActive, setisMealActive] = useState(true);
  const [isDeleteModalOpen, setisDeleteModalOpen] = useState(false);  // Modal state
  const dispatch = useDispatch()

  // useEffect to update states based on `Meal.DishStatus`
  useEffect(() => {
    if (itemStatus === "Available") {
      setisMealActive(true);
    } else {
      setisMealActive(false);
    }
  }, [Meal.status]);


  const handleDeleteClick = () => {
    setisDeleteModalOpen(true);  // Open Delete modal
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {

      const response = await dispatch(mealsMiddleware.DeleteMeal(Meal._id));
      if (response.success) {
        setisDeleteModalOpen(false)
        navigate(0)
      } else {
        console.error("Error Deleting Vendors");
      }
    } catch (error) {
      console.error("Error Deleting Vendor Status:", error);
    }
  };

  const handleDeleteCancel = () => {
    setisDeleteModalOpen(false);  // Close modal
  };

  // Toggle to change vendor state
  const handleToggleActive = async (e) => {
    e.stopPropagation();
    const newStatus = itemStatus === "Available" ? "Unavailable" : "Available";

    // Prepare the meal body to send to the API
    const mealBody = {
      status: newStatus   // Set the new status
    };

    // API Call
    try {

      const response = await dispatch(mealsMiddleware.UpdateMeal(Meal._id, mealBody));
      if (response.success) {
        setItemStatus(newStatus);
        setisMealActive(newStatus === "Available");
      } else {
        console.error("Error Deleting Vendors");
      }
    } catch (error) {
      console.error("Error Deleting Vendor Status:", error);
    }

  };

  return (
    <>
      <div
        className={`rounded-lg shadow-md p-2 text-center cursor-pointer h-fit ${isMealActive ? 'bg-gray-100' : 'bg-gray-300'
          }`}
        onClick={props.onClick}
        style={{ filter: isMealActive ? 'none' : 'grayscale(100%)' }} // Grayscale filter if inactive
      >
        <img
          src={Meal.image}
          alt={Meal.name}
          className="w-full h-48 object-cover rounded-md mb-2"
        />
        <h3 className="text-left text-lg font-medium truncate">{Meal.title}</h3>
        <div className="flex justify-between items-center">
          <p className="text-left text-sm text-gray-500">{Meal.vendorName}</p>
          <div className="flex items-center">
            <img src={StarIcon} alt="Star" className="h-5 w-5 ml-1" />
            {/* <div className="text-black ml-1">{Meal.rating || '5'}</div> */}
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex">
            {props.showToggle && (
              <button
                className={`w-8 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out hover:scale-110 ${isMealActive ? 'bg-orange-400' : 'bg-gray-200'
                  }`}
                onClick={handleToggleActive}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${isMealActive ? 'translate-x-2' : 'translate-x-0'
                    }`}
                />
              </button>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation when the button is clicked
              handleDeleteClick()
            }}
            className="text-red-500 hover:text-red-700">
            <img src={TrashIcon} alt="Delete" className="h-5 w-5 hover:scale-110" />
          </button>
        </div>
      </div>
      {isDeleteModalOpen && (
        <MealsDeleteModal
          onConfirm={handleDelete}
          onCancel={handleDeleteCancel}
          meal={Meal}
        />
      )}
    </>
  );

}


export default Card;