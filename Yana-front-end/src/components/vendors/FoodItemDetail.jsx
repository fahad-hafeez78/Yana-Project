import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import AddCircle from "../../assets/Icons/AddCircle.svg";
import StarIcon from "../../assets/Icons/star.svg";
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import food from "../../assets/food.jpeg"
import CrossButton from '../../elements/crossButton/CrossButton.jsx';
const FoodItemDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { item, vendorName } = location.state;

  const ingredients = item.details.split(",").map(ingredient => {
    // Capitalize the first letter of each word
    return ingredient
      .trim()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });


  const allergyWarnings = item.allergies.split(",").map(warning => {
    // Capitalize the first letter of each word
    return warning
      .trim()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });


  const nutritionInfo = item.nutritionInfo.split(",").map(Nutrition => {
    // Capitalize the first letter of each word
    return Nutrition
      .trim()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });



  return (
    <div className="w-full flex flex-col gap-5">
      {/* <div className="flex justify-end items-center ">
        
        <div className="flex items-center space-x-4">
          <ButtonWithIcon
            icon={<img src={AddCircle} className='w-5 h-5' alt="Add Circle Icon" />}
            text="Add Meals"
            className="bg-custom-blue text-white px-3 py-2 rounded-full"
          />
        </div>
      </div> */}

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden space-x-4">

        <div className="p-4">

          <div className='flex justify-between mb-4'>
            <h2 className="text-2xl text-yana-navy font-semibold">
              {vendorName}
            </h2>
            <CrossButton onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700" />
          </div>
          <div className="flex flex-col md:flex-row h-[calc(100vh-180px)] overflow-y-auto">

            <div className="md:w-1/2 pr-8">
              <img src={item.image} alt={item.title} className="w-full h-[60%] rounded-lg" />
              <div className="mt-4">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <div className="flex justify-between items-center">
                  <div className="flex">
                    {/* <p className="text-yana-red mr-1">$</p>
                    <span className="text-black text-lg">{item.DishPrice}</span> */}
                  </div>
                  <div className="flex items-center">
                    <img src={StarIcon} alt="Star" className="h-5 w-5 ml-1" />
                    <div className="text-black ml-1 text-lg">{item.rating || "5"}</div>
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
              <ul className="list-disc list-inside text-sm text-gray-600">
                {ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>

              <h3 className="font-semibold text-center text-lg mt-4 mb-2">Allergy Warnings</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {allergyWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>

              <h3 className="font-semibold text-center text-lg mt-4 mb-2">Nutrition</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {nutritionInfo.map((nutrition, index) => (
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

export default FoodItemDetail;
