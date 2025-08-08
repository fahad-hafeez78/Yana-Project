import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import vendorsMiddleware from "../../redux/middleware/vendorsMiddleware.js";
import DeleteModal from "./VendorDeleteModal";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';
import TrashIcon from "../../assets/customIcons/generalIcons/trash.svg";
import editIcon from "../../assets/customIcons/generalIcons/edit.svg";
import { showWarningAlert } from '../../redux/actions/alertActions.js';
import ImageModal from "../../elements/imageModal/ImageModal";

const VendorCard = ({ vendor, isEditPermission, isDeletePermission, fetchVendors }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(vendor.status === "active");
  const [status, setStatus] = useState(vendor.status);

  useEffect(() => {
    setIsActive(vendor.status === "active");
    setStatus(vendor.status);
  }, [vendor.status]);

  const handleVendorClick = () => {
    navigate(`/vendors/${vendor._id}/food-items`, {
      state: { vendorName: vendor.name }
    });
  };

  const handleEditVendor = (e) => {
    e.stopPropagation();
    navigate("edit-vendor", { state: { vendor, isEditPermission } });
  };

  const toggleVendorStatus = async (e) => {
    e.stopPropagation();
    const newStatus = status === "active" ? "inactive" : "active";

    try {
      const response = await dispatch(vendorsMiddleware.UpdateVendor(
        vendor?.unified_user?._id,
        { status: newStatus }
      ));

      if (response.success) {
        setStatus(newStatus);
        setIsActive(newStatus === "active");
      }
    } catch (error) {
      console.error("Error updating vendor status:", error);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(vendorsMiddleware.DelVendor(vendor?.unified_user?._id));
      if (response.success) {
        setIsDeleteModalOpen(false);
        fetchVendors();
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  };

  const formatAddress = () => {
    const { street, city, state, zipcode } = vendor.address || {};
    return [street, city, state, zipcode].filter(Boolean).join(", ");
  };

  return (
    <div className="relative">
      {/* Vendor Card */}
      <div
        className={`bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 items-start border-2 sm:items-center cursor-pointer transition-all duration-300 hover:shadow-lg`}
        onClick={handleVendorClick}
      >
        {/* Vendor Avatar and Status */}
        <div className="flex flex-col items-center space-y-2 min-w-[100px]">
          <img
            src={vendor.photo || '/MaleAvatar.png'}
            alt={vendor.name}
            className={`w-16 h-16 object-cover rounded-full border-2 ${isActive ? 'border-secondary' : 'border-gray-300'
              }`}
          />
          <span className={`text-sm font-medium ${isActive ? 'text-secondary-dark' : 'text-gray-500'
            }`}>
            {status.toUpperCase()}
          </span>

          {/* Status Toggle */}
          {isEditPermission && (
            <button
              onClick={toggleVendorStatus}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-secondary' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          )}
        </div>

        {/* Vendor Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 truncate">{vendor.name}</h3>
          <p className="text-sm text-gray-600 truncate">{vendor?.unified_user?.email}</p>
          <p className="text-sm text-gray-600">{vendor.phone}</p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {formatAddress()}
          </p>
          {/* <p className="text-sm font-medium text-blue-600 mt-1">
            {vendor.foodItems || 0} food items
          </p> */}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center self-end sm:self-center">
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="View W9 Form"
          >
            <ImageModal
              imageUrl={EyeIcon}
              modalImageUrl={vendor?.w9path}
              className="h-6 w-6 justify-center items-center"
            />
          </div>


          {isEditPermission && (
            <button
              onClick={handleEditVendor}
              className="p-2 rounded-full hover:bg-blue-50 transition-colors"
              aria-label="Edit vendor"
            >
              <img src={editIcon} alt="Edit" className="h-5 w-5" />
            </button>
          )}

          {isDeletePermission && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              className="p-2 rounded-full hover:bg-red-50 transition-colors"
              aria-label="Delete vendor"
            >
              <img src={TrashIcon} alt="Delete" className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          vendor={vendor}
        />
      )}
    </div>
  );
};

export default VendorCard;