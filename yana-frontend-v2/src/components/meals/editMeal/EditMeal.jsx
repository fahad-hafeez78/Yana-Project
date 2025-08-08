import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware.js';
import vendorsMiddleware from '../../../redux/middleware/vendorsMiddleware.js';
import { useDispatch } from 'react-redux';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import Spinner from '../../../elements/customSpinner/Spinner.jsx';
import { showWarningAlert } from '../../../redux/actions/alertActions.js';
import usePermissionChecker from '../../../util/permissionChecker/PermissionChecker.jsx';
import MealFormFields from '../FormField/MealFormFields.jsx';

const EditMeal = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const checkPermission = usePermissionChecker();
  const isVendorPermission = checkPermission('vendor', 'view');

  const location = useLocation();
  const { mealdata } = location.state;

  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState();

  const [imageUrl, setImageUrl] = useState(null);

  const [newMeal, setNewMeal] = useState({
    name: mealdata.name,
    image: Array.isArray(mealdata.image) ? mealdata.image : [mealdata.image],
    category: mealdata.category,
    vendor: { id: mealdata.vendorId?._id, name: mealdata.vendorId?.name },
    tags: mealdata.tags,
    description: mealdata.description,
    // Convert arrays to comma-separated strings for editing
    ingredients: Array.isArray(mealdata.ingredients) ? mealdata.ingredients.join(', ') : mealdata.ingredients,
    nutrition_info: Array.isArray(mealdata.nutrition_info) ? mealdata.nutrition_info.join(', ') : mealdata.nutrition_info,
    allergies: Array.isArray(mealdata.allergies) ? mealdata.allergies.join(', ') : mealdata.allergies,
    price: mealdata.price || 0,
    status: mealdata.status
  });

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
      } catch (error) {
        console.error("Error Fetching Vendors:", error);
      }
    };

    if (isVendorPermission) fetchVendors();
  }, []);


  // Update the handleInputChange function
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
    } else {
      // For all other fields, store the raw value (including commas)
      setNewMeal((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files); // Handle multiple files
    if (files.length > 0) {
      setNewMeal((prev) => ({ ...prev, image: files })); // Store files as an array
      const objectUrls = files.map(file => URL.createObjectURL(file));
      setImageUrl(objectUrls); // Store object URLs for display
    }
  };

  const handleRemoveImage = () => {
    setNewMeal((prev) => {
      return { ...prev, image: null };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Process comma-separated fields back into arrays
    const processedMeal = {
      ...newMeal,
      ingredients: typeof newMeal.ingredients === 'string'
        ? newMeal?.ingredients?.split(',')?.map(item => item.trim()).filter(Boolean)
        : newMeal?.ingredients,
      nutrition_info: typeof newMeal?.nutrition_info === 'string'
        ? newMeal?.nutrition_info?.split(',')?.map(item => item.trim()).filter(Boolean)
        : newMeal?.nutrition_info,
      allergies: typeof newMeal.allergies === 'string'
        ? newMeal?.allergies?.split(',')?.map(item => item.trim()).filter(Boolean)
        : newMeal?.allergies,
    };

    if (!processedMeal.name || !processedMeal.image.length || !processedMeal.category || !processedMeal.vendor?.id) {
      dispatch(showWarningAlert("Please fill all required fields."));
      return;
    }

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
    formData.append('status', processedMeal.status);

    // Append image files
    processedMeal.image.forEach(file => {
      if (file instanceof File) {
        formData.append('image', file);
      }
    });

    try {
      setIsLoading(true);
      const response = await dispatch(mealsMiddleware.UpdateMeal(mealdata._id, formData));
      if (response.success) {
        navigate('/meals');
      }
    } catch (error) {
      console.error("Error submitting meal:", error);
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
        <h1 className="text-2xl font-bold">Edit Meal</h1>
        <CrossButton onClick={() => navigate(-1)} className="text-gray hover:text-gray-dark" />
      </div>

      <MealFormFields

        formFields={newMeal}
        setFormFields={setNewMeal}

        imageUrl={imageUrl}
        vendors={vendors}

        isVendorPermission={isVendorPermission}

        handleInputChange={handleInputChange}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}

        handleDiscardClicking={handleDiscardClicking}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default EditMeal;
