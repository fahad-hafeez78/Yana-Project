import React from "react";
import FoodReviewItem from "../../../assets/meal.jpeg";
import customer from "../../../assets/customer.svg";
import CrossButton from "../../../elements/crossButton/CrossButton";

const Modal = ({ isOpen, onClose, review }) => {
  if (!isOpen) return null;

  // Function to render the stars based on the rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);

    let stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-500">⭐</span>);
    }
    return stars;
  };

  function timeSince(createdAt) {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInSeconds = Math.floor((now - createdDate) / 1000);

    const intervals = [
        { label: "year", seconds: 60 * 60 * 24 * 365 },
        { label: "month", seconds: 60 * 60 * 24 * 30 },
        { label: "week", seconds: 60 * 60 * 24 * 7 },
        { label: "day", seconds: 60 * 60 * 24 },
        { label: "hour", seconds: 60 * 60 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
        }
    }
    return "just now";
  }

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-white rounded-2xl shadow-lg p-6 w-96 max-w-md">
        {/* Circular Image */}
        <div className="absolute -top-12 left-1/2 transform -translate-y-10 -translate-x-1/2">
          <img
            src={review.DishPhotoPath || FoodReviewItem}
            alt="Food"
            className="w-40 h-40 rounded-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="mt-16 text-center">
          <h2 className="text-lg font-bold">{review.DishName}</h2>
          <p className="text-orange-500 font-bold">{review.VendorName}</p>

          {/* User Info */}
          <div className="flex justify-between">
            <div className="flex items-center justify-center mt-1 space-x-2">
              <img src={review.CsutomerProfilePhoto || customer} alt="User" className="w-10 h-10 rounded-full" />

              <div className="text-left">
                <p className="font-semibold">{review.Name}</p>
                <p className="text-xs text-gray-500">{timeSince(review.createdAt)}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center mt-3 space-x-2">
              {renderStars(review.DishRating)}
              <span className="text-gray-600">{review.DishRating}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mt-3 text-base text-left">
            {review.ReviewText}
          </p>
        </div>

        {/* Close Button */}
        <div
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
        >
          <CrossButton />
        </div>
      </div>
    </div>
  );
};

export default Modal;
