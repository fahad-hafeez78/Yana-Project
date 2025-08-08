import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "../../../assets/customIcons/generalIcons/back.svg";
import StarIcon from "../../../assets/customIcons/generalIcons/ratingIcon.svg";
import edit from "../../../assets/customIcons/generalIcons/edit.svg";
import ImageModal from '../../../elements/imageModal/ImageModal';

const MealDetails = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const meal = location.state?.item || null;
  const isEditPermission = location.state?.isEditPermission;

  if (!meal) {
    return <p>Loading meal details...</p>;
  }

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate('/meals/edit-meals', { state: { mealdata: meal } });
  };


  return (
    <div className="bg-white p-4 h-full flex flex-col rounded-2xl">
      {/* Header with back button and title */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <img src={ArrowBackIcon} alt="Back" className="w-6 h-6" />
        </button>

        <h1 className="text-xl text-yana-navy font-semibold">
          Dish Details
        </h1>

        {/* Edit button (conditionally shown) */}
        {isEditPermission && (
          <button
            onClick={handleEditClick}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <img src={edit} height={24} width={24} alt="Edit" />
          </button>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-grow overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm p-2">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Image and basic info */}
            <div className="lg:w-1/2">
              <div className="relative rounded-lg overflow-hidden mb-4">
                <ImageModal
                  imageUrl={meal?.image || '/meal_image.jpeg'}
                  imageText={meal?.name}
                  className="w-full max-h-80 object-cover" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h1 className="text-2xl font-bold">{meal.name}</h1>
                  {/* <div className="flex items-center">
                    <img src={StarIcon} alt="Star" className="h-5 w-5" />
                    <span className="ml-1 text-lg">{meal?.rating || "5"}</span>
                  </div> */}
                </div>

                {/* <div>
                  <h2 className="text-lg font-semibold mb-2">Vendor</h2>
                  <p className="text-red-600 font-medium">{meal?.vendorName}</p>
                </div> */}

                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">
                    {meal.description || "No description available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - Details lists */}
            <div className="lg:w-1/2 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-center">Ingredients</h3>
                <ul className="space-y-1 pl-5">
                  {meal?.ingredients?.length > 0 ? (
                    meal.ingredients.map((ingredient, index) => (
                      <li key={index} className="list-disc text-gray-dark">
                        {ingredient}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray">No ingredients listed</p>
                  )}
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-center">Allergy Warnings</h3>
                <ul className="space-y-1 pl-5">
                  {meal?.allergies?.length > 0 ? (
                    meal.allergies.map((warning, index) => (
                      <li key={index} className="list-disc text-gray-dark">
                        {warning}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray">No allergy warnings</p>
                  )}
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-center">Nutrition Information</h3>
                <ul className="space-y-1 pl-5">
                  {meal?.nutrition_info?.length > 0 ? (
                    meal.nutrition_info.map((nutrition, index) => (
                      <li key={index} className="list-disc text-gray-dark">
                        {nutrition}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray">No nutrition information available</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealDetails;
