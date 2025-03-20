import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomInput from "../../elements/customInput/CustomInput";
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import { useDispatch } from 'react-redux';
import vendorsMiddleware from "../../redux/middleware/vendorsMiddleware.js";
import CrossButton from '../../elements/crossButton/CrossButton.jsx';

const EditVendor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const location = useLocation();
  const { vendor } = location.state || {};
  const [vendorData, setVendorData] = useState(vendor);
  const [selectedImage, setSelectedImage] = useState(Array.isArray(vendorData.W9Path) ? vendorData.W9Path : [vendorData.W9Path]);
  const [emailError, setEmailError] = useState('');

  const handleImageChange = (e) => {
    const file = Array.from(e.target.files);  // Convert FileList to an array
    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null)
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value.replace(/\D/g, '');

    if (formattedValue.length <= 3) {
      formattedValue = `${formattedValue}`;
    } else if (formattedValue.length <= 6) {
      formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3)}`;
    } else if (formattedValue.length <= 10) {
      formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
    } else if (formattedValue.length >= 10) {
      formattedValue = formattedValue.slice(0, 10);
      formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
    }

    // Update the specific phone field based on the input's name attribute
    setVendorData((prevData) => ({
      ...prevData,
      [name]: formattedValue,  // Dynamically update the field specified by the name
    }));
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("Address.")) {
      const addressField = name.split(".")[1];
      setVendorData((prevData) => ({
        ...prevData,
        Address: {
          ...prevData.Address,
          [addressField]: value, // Update the specific subfield within Address
        },
      }));
    } else {
      setVendorData((prevData) => ({
        ...prevData,
        [name]: value, // Update other fields normally
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object
    const formData = new FormData();
    formData.append('Name', vendorData.Name);
    formData.append('Phone', vendorData.Phone);
    formData.append('Email', vendorData.Email);
    formData.append('Address', JSON.stringify(vendorData.Address));
    // formData.append('_id', vendorData._id);


    // Append the image files if selected
    if (selectedImage.length > 0) {
      for (const file of selectedImage) {
        formData.append('imagefile', file);  // Adjust field name if needed
      }
    }

    try {
      const response = await dispatch(vendorsMiddleware.UpdateVendor(vendorData._id, formData));
      if (response.success) {
        navigate('/vendors');
      } else {
        console.error("Error updating vendor.");
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
    }
  };

  const handleEmailBlur = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(vendorData.Email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className="container ">
      <div className='rounded-2xl bg-white p-6 shadow-md'>
        <h1 className="text-[#959595] mb-[15px] font-bold text-2xl">Edit Vendor</h1>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col overflow-y-auto px-2 h-[calc(100vh-250px)]'>
            <div className="flex flex-wrap gap-[10px] mb-[10px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="Name" className="block font-bold mb-[5px]">Name <span className='text-red-600'>*</span></label>
                <CustomInput
                  id="Name"
                  name="Name"
                  value={vendorData.Name}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="Phone" className="block font-bold mb-[5px]">Phone <span className='text-red-600'>*</span></label>
                <CustomInput
                  id="Phone"
                  name="Phone"
                  type='tel'
                  value={vendorData.Phone}
                  onChange={handlePhoneChange}
                  required
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex mb-[15px] w-full gap-3">
              <div className="w-full items-center py-2">
                <label htmlFor="Email" className="block font-bold mb-[5px]">Email <span className='text-red-600'>*</span></label>
                <CustomInput
                  id="Email"
                  name="Email"
                  type='email'
                  value={vendorData.Email}
                  onChange={handleInputChange}
                  onBlur={handleEmailBlur}
                  required
                  className="w-full"
                />
                {emailError && (
                  <span className="text-red-600 text-sm">{emailError}</span>
                )}
              </div>

              <div className="w-full items-center py-2">
                <p className="block font-bold mb-[5px]">Attach Vender W9</p>

                <div className='flex gap-2'>
                  <div className="relative inline-block border border-gray-300 rounded-md p-1">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      multiple
                      accept="image/*"
                      className="absolute inset-0 opacity-0 py-1"
                    />
                    <span className="text-gray-700">Choose Files</span>
                  </div>

                  <span className="text-gray-700 flex items-center">
                    {selectedImage?.length > 0
                      ? selectedImage?.map((image, index) => {
                        const fileName = typeof image === 'string'
                          ? image?.split('/').pop().replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-/, '') // Remove timestamp
                          : image?.name;
                        return <span key={index}>{fileName}</span>;
                      })
                      : 'No file selected'}
                    {selectedImage?.length > 0 &&
                      <CrossButton className='w-8 h-8' onClick={() => handleRemoveImage()} />
                    }
                  </span>
                </div>
              </div>
            </div>


            <h2 className="text-[#959595] mb-[10px] font-bold text-lg">Address</h2>
            <div className="flex flex-wrap gap-[10px] mb-[10px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="street1" className="block font-bold mb-[5px]">
                  Street Line1
                </label>
                <CustomInput
                  id="street1"
                  name="Address.street1"
                  value={vendorData.Address.street1}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="street2" className="block font-bold mb-[5px]">
                  Street Line2
                </label>
                <CustomInput
                  id="street2"
                  name="Address.street2"
                  value={vendorData.Address.street2}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="city" className="block font-bold mb-[5px]">
                  City
                </label>
                <CustomInput
                  id="city"
                  name="Address.city"
                  value={vendorData.Address.city}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="state" className="block font-bold mb-[5px]">
                  State
                </label>
                <CustomInput
                  id="state"
                  name="Address.state"
                  value={vendorData.Address.state}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="zipcode" className="block font-bold mb-[5px]">
                  Zipcode
                </label>
                <CustomInput
                  id="zipcode"
                  name="Address.zipcode"
                  value={vendorData.Address.zipcode}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              {/* <div className="flex-1 min-w-[1px]">
                <label htmlFor="country" className="block font-bold mb-[5px]">
                  Country
                </label>
                <CustomInput
                  id="country"
                  name="Address.country"
                  value={vendorData.Address.country}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div> */}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center gap-2 ">
            <ButtonWithIcon
              type="buttom"
              onClick={handleCancel}
              text="Discard"
              className="bg-red-600 text-white px-3 py-2 rounded-full min-w-[100px]"
            />
            <ButtonWithIcon
              type="submit"
              text="Save"
              className="bg-custom-blue text-white px-3 py-2 rounded-full min-w-[100px]"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVendor;
