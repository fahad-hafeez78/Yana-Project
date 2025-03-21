import React from 'react';
import PlusIcon from "../../../assets/Add.svg";
import MinusIcon from "../../../assets/Min.svg";
import trash from "../../../assets/trash.svg";

const OrderCard = ({ name, imgPath, count, onIncrement, onDecrement, onRemove }) => {
  return (
    <div className="relative flex  items-center gap-4 bg-white rounded-lg p-4 w-full max-w-xs md:max-w-lg">
      {/* Display meal image */}
      <img src={imgPath} alt={name} className="w-16 h-16 rounded-md flex-shrink-0" />

      {/* Ensure truncation works */}
      <div className="flex-grow min-w-0 ">
        <h3 className="font-semibold truncate overflow-hidden text-ellipsis whitespace-nowrap">{name}</h3>

        {/* Display count controls */}
        <div className="flex items-center space-x-2 mt-2">
          <button onClick={onDecrement} className="flex-shrink-0">
            <img src={MinusIcon} alt="Minus Icon" width={29} height={28} />
          </button>
          <span className="px-5">{count}</span>
          <button onClick={onIncrement} className="flex-shrink-0">
            <img src={PlusIcon} alt="Plus Icon" width={29} height={28} />
          </button>
        </div>
      </div>

      {/* Remove button (Trash Bin) */}
      <button
        onClick={onRemove}
        className="absolute bottom-2 right-2 text-red-500 hover:text-red-600"
        aria-label="Remove item"
      >
        <img src={trash} alt="Trash Icon" width={18} height={18} />
      </button>
    </div>


  );
};

export default OrderCard;
