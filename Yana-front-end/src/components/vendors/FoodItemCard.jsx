import React from "react";
import { useNavigate } from "react-router-dom";
import StarIcon from "../../assets/Icons/star.svg";
import food from "../../assets/food.jpeg"


const FoodItemCard = ({ item, vendorName }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/vendors/${item._id}/food-item/${item._id}`, {
      state: { item, vendorName }, // Pass vendorName in navigation state
    });
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-md p-4 text-center cursor-pointer" onClick={handleCardClick}>
      <img src={item.image} alt={item.title} className="w-full min-h-40 max-h-40 object-cover rounded-md mb-4" />
      <h3 className="text-left text-lg font-medium mb-2 truncate">{item.title}</h3>
      <div className="flex justify-between items-center">
        <div className="flex">
          {/* <p className="text-yana-red mr-1">$</p>
          <span className="text-black">{item.DishPrice}</span> */}
        </div>
        <div className="flex items-center">
          <img src={StarIcon} alt="Star" className="h-5 w-5 ml-1" />
          <div className="text-black ml-1">{item.rating || "5"}</div>
        </div>
      </div>
      <p className="text-left text-sm text-gray-500">Vendor: {vendorName}</p>
    </div>
  );
};

export default FoodItemCard;
