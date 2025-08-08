import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import MenuDeleteModal from '../menuDeleteModal/MenuDeleteModal';
import TrashIcon from '../../../assets/customIcons/generalIcons/trash.svg';
import menusMiddleware from '../../../redux/middleware/menusMiddleware';

const Card = (props) => {
  const {
    menuId,
    imgPath = '/default-image.jpg',
    name = 'Menu Item',
    vendorName = 'Vendor',
    onClick,
    fetchMenus,
    isDeletePermission = false
  } = props;

  const dispatch = useDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      const response = await dispatch(menusMiddleware.DeleteMenu(menuId));
      if (response.success) {
        setShowDeleteModal(false);
        fetchMenus?.();
      }
    } catch (error) {
      console.error('Failed to delete menu:', error);
    }
  };

  return (
    <div className="group relative h-64 w-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Clickable Card Area */}
      <div 
        className="flex h-full flex-col"
        onClick={onClick}
      >
        {/* Image Container (70% height) */}
        <div className="h-[70%] w-full overflow-hidden">
          <img
            src={imgPath}
            alt={`${name} menu`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Text Content (30% height) */}
        <div className="relative flex h-[30%] flex-col justify-between p-3">
          <div>
            <h3 className="line-clamp-2 text-lg font-bold text-gray-900">{name}</h3>
            <p className="mt-1 text-sm font-medium text-gray-600">{vendorName}</p>
          </div>
          
          {/* Delete Button positioned at bottom right */}
          {isDeletePermission && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="absolute bottom-4 right-3 "
              aria-label={`Delete ${name} menu`}
            >
              <img 
                src={TrashIcon} 
                alt="Delete" 
                className="h-5 w-5 text-red-500" 
              />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <MenuDeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          menu={{ menuId, name, vendorName, imgPath }}
        />
      )}
    </div>
  );
};

export default Card;