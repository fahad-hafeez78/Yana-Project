import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Checkbox from '../../../elements/checkBox/CheckBox.jsx';
import FormField from '../../../elements/formField/FormField.jsx';
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware.js';
import { useDispatch } from 'react-redux';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import CustomInput from '../../../elements/customInput/CustomInput.jsx';
import ImageIcon from "../../../assets/customIcons/generalIcons/ImageIcon.svg?react"


const EditMeals = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const location = useLocation();
  const { mealdata } = location.state;
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

  const [updatedMealData, setUpdatedMealData] = useState({
    title: mealdata.title,
    image: Array.isArray(mealdata.image) ? mealdata.image : [mealdata.image],
    category: mealdata.category,
    vendorId: mealdata.vendorId,
    vendorName: mealdata.vendorName,
    // vendor: { id: mealdata.vendorId, name: mealdata.VendorName },
    tags: JSON.parse(mealdata.tags[0]),
    description: mealdata.description,
    details: mealdata.details,
    nutritionInfo: mealdata.nutritionInfo,
    price: mealdata.price,
    allergies: mealdata.allergies,
    status: mealdata.status
  });
  const [imageUrl, setImageUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setUpdatedMealData((prev) => ({
        ...prev,
        tags: { ...prev.tags, [name]: checked },
      }));
    } else {
      setUpdatedMealData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setUpdatedMealData((prev) => ({
      ...prev,
      image: null, // Remove the image
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);  // Convert FileList to an array
    setUpdatedMealData((prev) => ({ ...prev, image: files }));

    const file = Array.from(e.target.files); // Convert FileList to an array
    if (file.length > 0) {
      const imageFile = file[0]; // Assuming only one file is selected
      setUpdatedMealData((prev) => ({ ...prev, image: file }));
      // Create an object URL for the selected image
      const objectUrl = URL.createObjectURL(imageFile);
      setImageUrl(objectUrl); // Store the object URL for display
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object for file and text data
    const formData = new FormData();
    // formData.append('DishID', mealdata._id.toString());
    formData.append('title', updatedMealData.title);
    formData.append('category', updatedMealData.category);
    formData.append('vendorId', updatedMealData.vendorId);
    formData.append('VendorName', updatedMealData.vendorName);
    // formData.append('MenuID', 0);
    formData.append('price', updatedMealData.price);
    formData.append('description', updatedMealData.description);
    formData.append('details', updatedMealData.details);
    formData.append('tags', JSON.stringify(updatedMealData.tags));
    formData.append('nutritionInfo', updatedMealData.nutritionInfo);
    formData.append('allergies', updatedMealData.allergies);
    formData.append('status', updatedMealData.status);

    // Append the image files if updated images are present
    if (updatedMealData.image && updatedMealData.image.length > 0) {
      for (const file of updatedMealData.image) {
        formData.append('imagefile', file);
      }
    }

    try {
      const response = await dispatch(mealsMiddleware.UpdateMeal(mealdata._id, formData));

      if (response.success) {
        navigate(-1); // Go back to the previous page
      } else {
        console.error('Error updating meal:', response.message);
      }
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };



  const handleDiscardClicking = (e) => {
    e.preventDefault();
    navigate(-1);
  };


  return (
    <div className="flex flex-col p-5 bg-white w-full gap-4 rounded-2xl">
      <h1 className="text-2xl font-bold">Edit Meal</h1>
      <form className="flex flex-col bg-white rounded-lg w-full gap-4" onSubmit={handleSubmit}>

        <div className='h-[calc(100vh-250px)] px-2 overflow-y-auto'>
          <div className='flex gap-4'>
            <div className=' w-full gap-10'>
              <h1 className='py-1 font-semibold'>Title <span className='text-red-600'>*</span></h1>
              <CustomInput
                id="title"
                type="text"
                name="title"
                placeholder="Add meal title..."
                value={updatedMealData.title}
                onChange={handleInputChange}
                required
                className="w-full"
              />

            </div>

            <div className="mb-4 w-full">
              <p className="mb-2 font-semibold">Meal image <span className='text-red-600'>*</span></p>
              <div className='flex'>
                <div className="relative inline-block border border-gray-300 rounded-md p-1 mr-2">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 py-1"
                  />
                  <span className="text-gray-700">Choose Files</span>
                </div>
                <span className="text-gray-700 flex items-center">
                  {updatedMealData?.image?.length > 0
                    ?
                    // updatedMealData.images.map((image) => {
                    //   const fileName = typeof image === 'string'
                    //     ? image.split('/').pop().replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-/, '') // Remove timestamp
                    //     : image.name;
                    //   return <span key={fileName}>{fileName}</span>;
                    // })

                    <ImageIcon className="cursor-pointer" onClick={() => window.open(imageUrl || updatedMealData?.image, '_blank')} />
                    : 'No file selected'}
                  {updatedMealData?.image?.length > 0 &&
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
                value={updatedMealData.category}
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

            <div className='flex flex-col flex-1'>
              <h1 className='py-1 font-semibold'>Vendor <span className='text-red-600'>*</span></h1>
              <CustomInput
                id="title"
                type="text"
                name="vendor"
                placeholder="Add meal title..."
                value={updatedMealData.vendorName}
                onChange={handleInputChange}
                required
                readOnly
                className="w-full"
              />

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
                  checked={updatedMealData.tags[item.name]}
                  onChange={handleInputChange}
                />
              ))}
            </div>
          </div>

          <div>
            <FormField
              fields={formFields}
              handleInputChange={handleInputChange}
              newMeal={updatedMealData}
              maxlength='255'
            />
          </div>
        </div>

        <div className="flex space-x-4 justify-center">
          <ButtonWithIcon
            type="button"
            text="Discard"
            onClick={handleDiscardClicking}
            className="bg-red-600 text-white px-3 min-w-[100px] rounded-full"
          />

          <ButtonWithIcon
            type="submit"
            text="Confirm"
            className="bg-custom-blue text-white px-3 min-w-[100px] rounded-full"
          />
        </div>
      </form>
    </div>
  );
};

export default EditMeals;