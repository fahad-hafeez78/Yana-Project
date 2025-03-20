import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkbox from '../../../elements/checkBox/CheckBox.jsx';
import FormField from '../../../elements/formField/FormField.jsx';
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware.js';
import vendorsMiddleware from '../../../redux/middleware/vendorsMiddleware.js';
import { useDispatch } from 'react-redux';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import CustomInput from '../../../elements/customInput/CustomInput.jsx';
import ImageIcon from "../../../assets/customIcons/generalIcons/ImageIcon.svg?react"

const AddMeals = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const [vendors, setVendors] = useState()


  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await dispatch(vendorsMiddleware.GetAllVendors());
        if (response.success) {
          setVendors(response.data);
        } else {
          console.error("Error Fetching Vendors");
        }
      } catch (error) {
        console.error("Error Fetching Vendors:", error);
      }
    };

    fetchVendors();
  }, []);


  const checkboxOptions = [
    { name: "lowSodium", label: "Low-sodium" },
    { name: "lactoseIntolerant", label: "Lactose Intolerant" },
    { name: "diabeticFriendly", label: "Diabetic Friendly" },
    { name: "vegetarian", label: "Vegetarian" },
    { name: "glutenFree", label: "Gluten Free" }
  ];

  const formFields = [
    { label: "Meal Description", name: "description", placeholder: "Add meal description..." },
    { label: "Ingredients", name: "details", placeholder: "Add ingredients..." },
    { label: "Nutrition Info", name: "nutritionInfo", placeholder: "Add nutrition info..." },
    { label: "Allergies", name: "allergies", placeholder: "Add allergies..." }
  ];
  const [imageUrl, setImageUrl] = useState(null);
  const [newMeal, setNewMeal] = useState({
    title: '',
    image: '',
    category: '',
    vendorId: '',
    vendorName: '',
    tags: {
      lowSodium: false,
      lactoseIntolerant: false,
      diabeticFriendly: false,
      vegetarian: false,
      glutenFree: false,
    },
    description: '',
    details: '',
    nutritionInfo: '',
    price: '23',
    allergies: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setNewMeal((prev) => ({
        ...prev,
        tags: { ...prev.tags, [name]: checked },
      }));
    } else {
      setNewMeal((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    e.preventDefault();
    const file = Array.from(e.target.files); // Convert FileList to an array
    if (file.length > 0) {
      const imageFile = file[0]; // Assuming only one file is selected
      setNewMeal((prev) => ({ ...prev, image: file }));
      // Create an object URL for the selected image
      const objectUrl = URL.createObjectURL(imageFile);
      setImageUrl(objectUrl); // Store the object URL for display
    }
  };

  const handleRemoveImage = () => {
    setNewMeal((prev) => ({
      ...prev,
      image: null, // Remove the image
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Create FormData object for file and text data
    const formData = new FormData();
    formData.append('title', newMeal.title);
    formData.append('category', newMeal.category);
    formData.append('vendorId', newMeal.vendorId);
    formData.append('vendorName', newMeal.vendorName);
    // formData.append('MenuID', 0)
    formData.append('price', newMeal.price);
    formData.append('description', newMeal.description);
    formData.append('details', newMeal.details);
    formData.append('tags', JSON.stringify(newMeal.tags));
    formData.append('nutritionInfo', newMeal.nutritionInfo);
    formData.append('allergies', newMeal.allergies);
    formData.append('status', 'Available');

    // Append the image files
    if (newMeal.image && newMeal.image.length > 0) {
      for (const file of newMeal.image) {
        formData.append('imagefile', file)
      }
    }

    try {

      const response = await dispatch(mealsMiddleware.CreateNewMeal(formData));

      if (response.success) {
        navigate('/meals');
      } else {
        console.error('Error submitting meal:', response.message);
      }
    } catch (error) {
      console.error('Error submitting meal:', error);
    }
  };



  const handleDiscardClicking = () => {
    navigate('/meals');
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-white w-full rounded-2xl">

      <div className='flex justify-between'>
        <h1 className="text-2xl font-bold">Add Meal</h1>
        <CrossButton onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700" />
      </div>

      <form className="flex flex-col gap-4 bg-white rounded-lg w-full" onSubmit={handleSubmit}>

        <div className='px-2 h-[calc(100vh-250px)] overflow-y-auto'>

          <div className='flex gap-4'>
            <div className=' w-full gap-10 '>
              <h1 className='py-1 font-semibold'>Title <span className='text-red-600'>*</span></h1>
              <CustomInput
                id="title"
                type="text"
                name="title"
                placeholder="Add meal title..."
                value={newMeal.title}
                onChange={handleInputChange}
                required
                className="w-full"
              />

            </div>

            <div className="mb-4 w-full">
              <p className="mb-2 font-semibold">Add meal image <span className='text-red-600'>*</span></p>
              <div className='flex'>
                <div className="relative inline-block border border-gray-300 rounded-md p-1 mr-2">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    required
                    accept="image/*"
                    className="absolute inset-0 opacity-0 py-1"
                  />
                  <span className="text-gray-700">Choose Files</span>
                </div>
                <span className="text-gray-700 flex items-center">
                  {newMeal?.image?.length > 0 ?
                    // newMeal?.DishPhotoPath.map(file => file.name).join(', ') 
                    <ImageIcon className="cursor-pointer" onClick={() => window.open(imageUrl || newMeal?.image, '_blank')} />
                    : 'No file selected'}
                  {newMeal?.image?.length > 0 &&
                    <CrossButton className='w-8 h-8' onClick={() => handleRemoveImage()} />
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-4 w-full">
            <div className="flex flex-col flex-1">
              <h1 className='mb-2 font-semibold'>Meal Category <span className='text-red-600'>*</span></h1>
              <select
                name="category"
                value={newMeal.category}
                onChange={handleInputChange}
                required
                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100"
              >
                <option value="">Select Category</option>
                <option value="BreakFast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>

            <div className="flex flex-col flex-1">
              <h2 className='mb-2 font-semibold'>Vendor <span className='text-red-600'>*</span></h2>
              <select
                name="vendor"
                value={newMeal.vendorId || ""}
                onChange={(e) => {
                  const selectedVendorId = e.target.value;
                  const selectedVendor = vendors.find((vendor) => vendor._id === selectedVendorId);
                  if (selectedVendor) {
                    setNewMeal((prev) => ({
                      ...prev,
                      vendorId: selectedVendor._id,
                      vendorName: selectedVendor.Name,
                    }));
                  }
                }}
                required
                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100"
              >
                <option value="">Select Vendor</option>
                {vendors && vendors.length > 0 ? (
                  vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.Name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading Vendors...</option>
                )}
              </select>
            </div>
          </div>

          <div className="w-full mb-4">
            <h1 className="font-semibold mb-2">Meal Labels</h1>
            <div className="flex flex-wrap gap-24">
              {checkboxOptions.map((item) => (
                <Checkbox
                  key={item.name}
                  name={item.name}
                  label={item.label}
                  checked={newMeal.tags[item.name]}
                  onChange={handleInputChange}
                />
              ))}
            </div>
          </div>

          <div>
            <FormField
              fields={formFields}
              handleInputChange={handleInputChange}
              newMeal={newMeal}
              maxlength='255'
            />
          </div>
        </div>
        <div className="flex space-x-4 justify-center">
          <ButtonWithIcon
            type="button"
            text="Discard"
            onClick={handleDiscardClicking}
            className="bg-red-600 text-white px-3 py-2 min-w-[100px] rounded-full"
          />

          <ButtonWithIcon
            type="submit"
            text="Confirm"
            className="bg-custom-blue text-white px-3 py-2 min-w-[100px] rounded-full"
          />
        </div>
      </form>
    </div>
  );
};

export default AddMeals;