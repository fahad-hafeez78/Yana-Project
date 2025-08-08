import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware.js';
import vendorsMiddleware from '../../../redux/middleware/vendorsMiddleware.js';
import { useDispatch } from 'react-redux';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import Spinner from '../../../elements/customSpinner/Spinner.jsx';
import MealFormFields from '../FormField/MealFormFields.jsx';
import usePermissionChecker from '../../../util/permissionChecker/PermissionChecker.jsx';

const AddMeals = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const checkPermission = usePermissionChecker();
  const isVendorPermission = checkPermission('vendor', 'view');

  const [vendors, setVendors] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await dispatch(vendorsMiddleware.GetAllVendors("active"));
        if (response.success) {

          const options = response?.vendors?.map(role => ({
            value: role._id,
            label: role.name,
          }));
          setVendors([{ value: "", label: "Select" }, ...options]);
          
        } 
        else {
          console.error("Error Fetching Vendors");
        }
      } catch (error) {
        console.error("Error Fetching Vendors:", error);
      }
    };

    if (isVendorPermission) fetchVendors();
  }, []);


  const [imageUrl, setImageUrl] = useState(null);
  const [newMeal, setNewMeal] = useState({
    name: '',
    image: null,
    category: '',
    vendor: isVendorPermission ? vendors : {},
    tags: [], // Initialize as an empty array
    description: '',
    ingredients: '',
    nutrition_info: '',
    price: '23',
    allergies: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setNewMeal((prev) => {
        let updatedTags = [...prev.tags];
        if (checked) {
          updatedTags.push(value);
        } else {
          updatedTags = updatedTags.filter((tag) => tag !== value);
        }
        return { ...prev, tags: updatedTags };
      });
    }
    else if (name === 'ingredients' || name === 'nutrition_info' || name === 'allergies') {
      // Update the field value directly (will show raw input with commas)
      setNewMeal((prev) => ({ ...prev, [name]: value }));
    }
    else {
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
      image: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Process comma-separated fields into arrays
    const processedMeal = {
      ...newMeal,
      ingredients: newMeal?.ingredients?.split(',')?.map(item => item?.trim())?.filter(Boolean) || [],
      nutrition_info: newMeal?.nutrition_info?.split(',')?.map(item => item.trim()).filter(Boolean) || [],
      allergies: newMeal?.allergies?.split(',')?.map(item => item.trim()).filter(Boolean) || [],
    };

    const formData = new FormData();
    formData.append('name', processedMeal.name);
    formData.append('category', processedMeal.category);
    formData.append('vendorId', processedMeal.vendor.id);
    formData.append('price', processedMeal.price);
    formData.append('description', processedMeal.description);
    formData.append('ingredients', JSON.stringify(processedMeal.ingredients));
    formData.append('tags', JSON.stringify(processedMeal.tags));
    formData.append('nutrition_info', JSON.stringify(processedMeal.nutrition_info));
    formData.append('allergies', JSON.stringify(processedMeal.allergies));
    formData.append('status', 'active');

    if (newMeal.image && newMeal.image.length > 0) {
      for (const file of newMeal.image) {
        formData.append('image', file);
      }
    }

    try {
      setIsLoading(true);
      const response = await dispatch(mealsMiddleware.CreateNewMeal(formData));
      if (response.success) {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error submitting meal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardClicking = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
  }

  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Add Meal</h1>
        <CrossButton onClick={() => navigate(-1)} className="text-gray hover:text-gray-dark" />
      </div>

      <MealFormFields
        formFields={newMeal}
        setFormFields={setNewMeal}

        imageUrl={imageUrl}
        vendors={vendors}

        handleInputChange={handleInputChange}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}
        isVendorPermission={isVendorPermission}

        handleDiscardClicking={handleDiscardClicking}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default AddMeals;
