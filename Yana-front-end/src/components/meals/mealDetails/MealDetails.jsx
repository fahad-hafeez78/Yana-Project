import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ArrowBackIcon from "../../../assets/customIcons/generalIcons/back.svg"
import StarIcon from "../../../assets/Icons/star.svg";
import food from "../../../assets/food.jpeg";
import edit from "../../../assets/edit.svg";

const MealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(location.state?.item || null);
  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate('/meals/editmeals', { state: { mealdata: item } });
  };

  if (!item) {
    return <p>Loading meal details...</p>;
  }

  const ingredients = item.details?.split(",").map(ingredient =>
    ingredient.trim().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  );

  const allergyWarnings = item.allergies?.split(",").map(warning =>
    warning.trim().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  );

  const nutritionInfo = item.nutritionInfo?.split(",").map(nutrition =>
    nutrition.trim().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  );

  return (
    <div className="container p-4">
      <div className="flex items-center mb-4 space-x-4">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2">
          <img src={ArrowBackIcon} alt="Back" className="w-8 h-8" />
        </button>

        <h1 className="text-xl text-yana-navy font-semibold">
          Dish Details
        </h1>
        <button
          className="absolute px-3 right-2 text-left rounded-lg"
          onClick={handleEditClick}
        ><img
            src={edit}
            height={28}
            width={28}
            alt="Edit"
          />
        </button>
      </div>

      <div className="w-[90%] mx-auto bg-white shadow-lg rounded-2xl overflow-auto space-x-4 h-[calc(100vh-180px)]">
        <div className="p-8">
          <div className="flex flex-col md:flex-row">
            {/* Meal Details Content */}
            <div className="md:w-1/2 pr-8">
              <img src={item.image ? item.image : food} alt={item.name} className="w-full h-[60%] object-cover rounded-lg" />
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-lg font-semibold">{item.name}</h1>
                  <div className="flex">
                    {/* <p className="text-yana-red mr-1">$</p>
                  <span className="text-black text-md">{item.DishPrice}</span> */}
                  </div>
                </div>
                <div className="flex justify-between items-center border-b">
                  <h2 className="text-xl text-yana-navy font-semibold text-red-600">{item.vendorName}</h2>
                  <div className="flex items-center">
                    <img src={StarIcon} alt="Star" className="h-5 w-5 ml-1" />
                    <div className="text-black ml-1 text-lg">{item?.rating || "5"}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mt-4 mb-2">Description</h3>
                <p className="text-gray-600 mt-2 text-sm">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="md:w-1/2 mt-4 md:mt-0 pl-8">
              <h3 className="font-semibold text-center text-lg mb-2">Ingredients</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 border-b">
                {ingredients?.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>

              <h3 className="font-semibold text-center text-lg mt-4 mb-2">Allergy Warnings</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 border-b">
                {allergyWarnings?.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>

              <h3 className="font-semibold text-center text-lg mt-4 mb-2">Nutrition</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 border-b">
                {nutritionInfo?.map((nutrition, index) => (
                  <li key={index}>{nutrition}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealDetails;
