import React, { useEffect, useState } from 'react';
import TrashIcon from "../../../assets/customIcons/generalIcons/trash.svg";
import MealsDeleteModal from "../mealsDeleteModal/MealsDeleteModal";
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware';
import { useDispatch } from 'react-redux';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon';

function Card({ meal, showToggle, onClick, isEditPermission, isDeletePermission, fetchMeals }) {
  const dispatch = useDispatch();
  const [itemStatus, setItemStatus] = useState(meal.status || "active");
  const [isMealActive, setIsMealActive] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setIsMealActive(itemStatus === "active");
  }, [meal.status]);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      const response = await dispatch(mealsMiddleware.DeleteMeal(meal._id));
      if (response.success) {
        setIsDeleteModalOpen(false);
        fetchMeals();
      }
    } catch (error) {
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleToggleActive = async (e) => {
    e.stopPropagation();
    const newStatus = itemStatus === "active" ? "inactive" : "active";
    const mealBody = { status: newStatus };

    try {
      const response = await dispatch(mealsMiddleware.UpdateMeal(meal._id, mealBody));
      if (response.success) {
        setItemStatus(newStatus);
        setIsMealActive(newStatus === "active");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <>
      <div
        className={`relative rounded-lg overflow-hidden shadow-md cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${isMealActive ? 'bg-white' : 'bg-gray-100'
          }`}
        onClick={onClick}
        style={{ filter: isMealActive ? 'none' : 'grayscale(80%)' }}
      >
        {/* Meal Image */}
        <div className="relative pt-[70%]">
          <img
            src={meal.image}
            alt={meal.name}
            className="absolute top-0 left-0 w-full h-full object-cover hover:scale-[1.01]"
          />
          {!isMealActive && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                INACTIVE
              </span>
            </div>
          )}
        </div>

        {/* Meal Info */}
        <div className="p-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">{meal.name}</h3>
          <p className="text-sm text-gray-600 truncate">{meal.vendorId?.name}</p>

          {/* Actions */}
          <div className="flex justify-between items-center ">
            <div className="flex items-center">
              {showToggle && isEditPermission && (
                <button
                  onClick={handleToggleActive}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isMealActive ? 'bg-primary' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isMealActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              )}
            </div>

            {isDeletePermission && (
              <ButtonWithIcon
                className="text-red-500 hover:text-red-700"
                icon={<img src={TrashIcon} alt="Delete" className="h-5 w-5" />}
                onClick={handleDeleteClick}
              />
            )}
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <MealsDeleteModal
          onConfirm={handleDelete}
          onCancel={handleDeleteCancel}
          meal={meal}
        />
      )}
    </>
  );
}

export default Card;