import React, { useState } from 'react';
import MenuDeleteModal from '../menuDeleteModal/MenuDeleteModal';
import TrashIcon from '../../../assets/trash.svg';
import { useDispatch } from 'react-redux';
import menusMiddleware from '../../../redux/middleware/menusMiddleware';

function Card(props) {
  const Menu = props || {};
  const dispatch = useDispatch()
  const [isDeleteModalOpen, setisDeleteModalOpen] = useState(false); // Modal state

  const handleDeleteClick = () => {
    setisDeleteModalOpen(true); // Open Delete modal
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      
      const response = await dispatch(menusMiddleware.DeleteMenu(Menu.menuId));
      if (response.success) {
        setisDeleteModalOpen(false);
        navigate(0);
      } else {
        console.error('Error Deleting Vendors');
      }
    } catch (error) {
      console.error('Error Deleting Vendor Status:', error);
    }
  };

  const handleDeleteCancel = () => {
    setisDeleteModalOpen(false); // Close modal
  };

  return (
    <>
      <div
        className="relative rounded-md cursor-pointer w-full h-64 bg-white overflow-hidden" // Added relative positioning
        onClick={Menu.onClick}
      >
        <div className="relative w-full h-full rounded-md shadow-md overflow-hidden group"> {/* Added 'group' class for hover effect */}
          <img
            src={Menu.imgPath || '/default-image.jpg'} // Fallback for missing image
            alt={Menu.name || 'Meal'}
            className="w-full h-full object-cover rounded-md"
          />
          <div className="absolute bottom-2 px-3 left-2 text-left rounded-lg bg-[#FFE6E9]">
            <h1 className="text-md font-semibold text-[#DC2626]">
              {Menu.name || 'Unnamed Meal'}
            </h1>
          </div>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation when the button is clicked
              handleDeleteClick();
            }}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" // Added positioning and hover effect
          >
            <img src={TrashIcon} alt="Delete" className="h-5 w-5 hover:scale-110" />
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <MenuDeleteModal
          onConfirm={handleDelete}
          onCancel={handleDeleteCancel}
          menu={Menu}
        />
      )}
    </>
  );
}

export default Card;
