import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import vendorsMiddleware from "../../redux/middleware/vendorsMiddleware.js";
import DeleteModal from "./VendorDeleteModal";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';
import TrashIcon from "../../assets/trash.svg";
import edit from "../../assets/edit.svg"

const VendorCard = ({ vendor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setisDeleteModalOpen] = useState(false);  // Modal state
  const [vendorStatus, setvendorStatus] = useState(vendor.Status); // Check if vendor status is "Active"
  const [isVendorActive, setisVendorActive] = useState(false); // Check if vendor status is "Active"

  useEffect(() => {
    setvendorStatus(vendor.Status);
    if (vendorStatus == "Active") {
      setisVendorActive(true)
    }
    else
      setisVendorActive(false)

  }, [])

  const handleVendorClick = (e) => {
    e.preventDefault();
    // Navigate to the specific vendor's food items page, passing vendor name through state
    navigate(`/vendors/${vendor._id}/food-items`, {
      state: { vendorName: vendor.Name }
    });
  };

  const handleViewW9FormClick = (W9Form) => {
    if (W9Form) {
      window.open(W9Form, '_blank');
    } else {
      console.error("No W9 form available for this vendor.");
    }
  };

  const handleEditVendorClick = () => {
    // Navigate to the specific vendor's food items page, passing vendor name through state
    navigate("editvendor", {
      state: { vendor }
    });
  };

  // Toggle to change vendor state
  const handleToggleActive = async (e) => {
    e.stopPropagation();
    setisVendorActive(!isVendorActive);
    try {
      if (vendorStatus === "Active") {
        vendor.Status = "Inactive";
      } else if (vendorStatus === "Inactive") {
        vendor.Status = "Active";
      }

      const updateVendorStatus = {
        "Status": vendor.Status
      }

      const response = await dispatch(vendorsMiddleware.UpdateVendor(vendor._id, updateVendorStatus));
      if (response.success) {
        console.log("Status Updated")
      } else {
        console.error("Error Fetching Vendors");
      }
    } catch (error) {
      console.error("Error Updating Vendor Status:", error);
    }
  };

  // Function call if click on delete icon
  const handleDeleteClick = () => {
    setisDeleteModalOpen(true);  // Open Delete modal
  };

  // Function call if user confirm to delete the vendor
  const handleDeleteConfirm = async (e) => {
    e.preventDefault();

    // setisDeleteModalOpen(false);  // Close modal
    try {
      // if (vendorStatus === "Active") {
      //   vendor.Status = "Inactive";
      // } else if (vendorStatus === "Inactive") {
      //   vendor.Status = "Active";
      // }
      const response = await dispatch(vendorsMiddleware.DeleteVendor(vendor._id));

      if (response.success) {
        setisDeleteModalOpen(false)
        navigate(0)
      } else {
        console.error("Error Deleting Vendors");
      }
    } catch (error) {
      console.error("Error Deleting Vendor Status:", error);
    }
  };

  const handleDeleteCancel = () => {
    setisDeleteModalOpen(false);  // Close modal
  };

  return (
    <>
      <div
        className={`bg-gray-100 rounded-lg shadow-md py-4 px-4 flex items-center flex-wrap md:flex-nowrap gap-4 cursor-pointer`}
        onClick={handleVendorClick}
      >
        <div className="mr-4 md:mr-0 flex flex-col items-center space-y-2">
          {/* Fix the image size */}
          {/* {vendor.ProfilePhotoPath && */}
          <img
            src={vendor.image || 'MaleAvatar.png'}
            alt={vendor.Name}
            className={`w-20 max-w-12 h-12  object-cover rounded-full shadow-lg transition-all duration-300 ${isVendorActive ? '' : 'filter grayscale opacity-50'}`}
            style={{ objectFit: 'cover' }}
          />
          {/* } */}
          <span className="text-center text-sm font-medium">
            Status: <br /> {vendor.Status}
          </span>

          {/* Toggle Button */}
          <button
            className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isVendorActive ? 'bg-orange-400' : 'bg-gray-200'}`}
            onClick={handleToggleActive}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${isVendorActive ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* Vendor Info */}
        <div className={`flex-grow transition-colors duration-300 ${isVendorActive ? '' : 'text-gray-400'}`}>
          <h3 className="text-lg font-semibold truncate max-w-[200px]">{vendor.Name}</h3> {/* Added max-width & truncate */}
          <p className="text-sm font-medium">{vendor.Email}</p>
          <p className="text-sm">{vendor.Phone}</p>
          <p className="text-sm hidden md:block break-words overflow-hidden max-w-full line-clamp-3">
            {
              [
                vendor.Address?.street1 || "",
                vendor.Address?.street2 || "",
                vendor.Address?.city || "",
                vendor.Address?.state || "",
                vendor.Address?.zipcode || "",
                // vendor.Address?.country || ""
              ]
                .filter(value => value)
                .join(" -- ")
                .trim()
            }
          </p>
          <p className="text-sm">{vendor.foodItems} food items</p>
        </div>

        {/* Icons Section */}
        <div className="flex mt-4 md:mt-0 justify-end ">
          <button
            className="w-10 h-10 text-gray-600 hover:text-blue-600 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleViewW9FormClick(vendor.W9Path);
            }}
          >
            <img src={EyeIcon} alt="View" className="h-6 w-6" />
          </button>

          <button
            className="w-10 h-10 text-gray-600 hover:text-blue-600 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleEditVendorClick();
            }}
          >
            <img src={edit} alt="Edit" className="h-6 w-6" />
          </button>

          <button
            className="w-10 h-10 text-gray-600 hover:text-red-600 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
          >
            <img src={TrashIcon} alt="Delete" className="h-6 w-6" />
          </button>
        </div>
      </div>


      {/* Render Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          vendor={vendor}
        />
      )}
    </>
  );
};

export default VendorCard;
