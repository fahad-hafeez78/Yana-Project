import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomInput from "../../elements/customInput/CustomInput";
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import { useDispatch } from 'react-redux';
import vendorsMiddleware from "../../redux/middleware/vendorsMiddleware.js";
import CrossButton from '../../elements/crossButton/CrossButton.jsx';
import { showErrorAlert } from '../../redux/actions/alertActions.js';
import Spinner from '../../elements/customSpinner/Spinner.jsx';
import usePhoneFormatter from '../../util/phoneFormatter/phoneFormatter.jsx';
import ImageModal from '../../elements/imageModal/ImageModal.jsx';

const EditVendor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const location = useLocation();
  const { vendor, isEditPermission } = location.state || {};
  const [vendorData, setVendorData] = useState(vendor);
  const [selectedImage, setSelectedImage] = useState(Array.isArray(vendorData?.w9path) ? vendorData?.w9path : [vendorData?.w9path]);
  const [imageUrl, setImageUrl] = useState(null);


  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files); // Handle multiple files
    if (files.length > 0) {
      setSelectedImage(files); // Store files as an array
      const objectUrls = files.map(file => URL.createObjectURL(file));
      setImageUrl(objectUrls); // Store object URLs for display
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null)
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = usePhoneFormatter(value);

    // Update the specific phone field based on the input's name attribute
    setVendorData((prevData) => ({
      ...prevData,
      [name]: formattedValue,  // Dynamically update the field specified by the name
    }));
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1]; // Extract the field name (e.g., street, city, etc.)
      setVendorData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value, // Update the specific subfield within address
        },
      }));
    }
    else if (name.startsWith("unified_user.")) {
      const unifeid_user_Fields = name.split(".")[1]; // Extract the field name (e.g., street, city, etc.)
      setVendorData((prevData) => ({
        ...prevData,
        unified_user: {
          ...prevData.unified_user,
          [unifeid_user_Fields]: value, // Update the specific subfield within address
        },
      }));
    }
    else {
      setVendorData((prevData) => ({
        ...prevData,
        [name]: value, // Update other fields normally
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (vendorData?.phone.length < 14) {
      dispatch(showErrorAlert('Enter Valid Phone number'));
      return;
    }
    // Create a FormData object
    const formData = new FormData();
    formData.append('name', vendorData?.name);
    formData.append('phone', vendorData?.phone);
    formData.append('email', vendorData?.unified_user.email);
    formData.append('address', JSON.stringify(vendorData?.address));


    // Append the image files if selected
    if (selectedImage.length > 0) {
      for (const file of selectedImage) {
        formData.append('w9path', file);  // Adjust field name if needed
      }
    }

    try {
      setIsLoading(true);
      const response = await dispatch(vendorsMiddleware.UpdateVendor(vendorData?.unified_user._id, formData));
      if (response.success) {
        console.log("Vendor Updated Successfully.");
        navigate('/vendors');
      } else {
        console.error("Error updating vendor.");
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  if (isLoading) {
    return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
  }

  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Vendor</h1>
        <CrossButton onClick={() => navigate(-1)} className="text-gray hover:text-gray-dark" />
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col flex-grow min-h-0">
        {/* Scrollable content area */}
        <div className="flex-grow overflow-y-auto px-2 space-y-4">
          {/* Vendor Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              label="Name"
              name="name"
              value={vendorData?.name}
              validationKey="alphanumeric"
              onChange={handleInputChange}
              required
              readOnly={!isEditPermission}
            />
            <CustomInput
              label="Phone"
              name="phone"
              type="tel"
              value={vendorData?.phone}
              onChange={handlePhoneChange}
              required
              readOnly={!isEditPermission}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <CustomInput
              label="Email"
              name="unified_user.email"
              type="email"
              value={vendorData?.unified_user?.email}
              onChange={handleInputChange}
              required
              readOnly={!isEditPermission}
            />
            <div>
              <label className="block font-semibold">
                Attach Vendor W9 <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative inline-block border border-gray-light rounded-md p-1">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    required={!selectedImage || selectedImage.length === 0}
                    accept="image/*"
                    disabled={!isEditPermission}
                    key={selectedImage ? 'has-image' : 'no-image'}
                    className="absolute inset-0 opacity-0 py-1 w-full"
                  />
                  <span className="text-gray-dark">Choose File</span>
                </div>
                {selectedImage?.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <ImageModal
                      imageUrl={imageUrl || selectedImage}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <CrossButton
                      className="w-8 h-8"
                      onClick={handleRemoveImage}
                      disabled={!isEditPermission}
                    />
                  </div>
                ) : (
                  <span className="text-gray">No file selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput
                label="Street Line 1"
                name="address.street1"
                value={vendorData?.address.street1}
                onChange={handleInputChange}
                validationKey="street"
                required
                readOnly={!isEditPermission}
              />
              <CustomInput
                label="Street Line 2"
                name="address.street2"
                value={vendorData?.address.street2}
                onChange={handleInputChange}
                validationKey="street"
                readOnly={!isEditPermission}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <CustomInput
                label="City"
                name="address.city"
                value={vendorData?.address.city}
                required
                validationKey="cityorstate"
                onChange={handleInputChange}
                readOnly={!isEditPermission}
              />
              <CustomInput
                label="State"
                name="address.state"
                value={vendorData?.address.state}
                required
                validationKey="cityorstate"
                onChange={handleInputChange}
                readOnly={!isEditPermission}
              />
              <CustomInput
                label="Zip Code"
                name="address.zip"
                value={vendorData?.address.zip}
                required
                minLength={3}
                maxLength={10}
                readOnly={!isEditPermission}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Sticky footer with action buttons */}
        <div className="sticky bottom-0 bg-white pt-4">
          <div className="flex justify-center gap-4 py-2">
            <ButtonWithIcon
              type="button"
              onClick={handleCancel}
              text="Discard"
              variant="discard"
            />
            {isEditPermission && (
              <ButtonWithIcon
                type="submit"
                text="Save"
                variant="confirm"
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditVendor;
