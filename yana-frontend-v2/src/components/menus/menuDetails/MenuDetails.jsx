import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from 'react-redux';
import menusMiddleware from '../../../redux/middleware/menusMiddleware.js';
import { showErrorAlert, showWarningAlert } from '../../../redux/actions/alertActions.js';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware.js';
import Spinner from '../../../elements/customSpinner/Spinner.jsx';
import usePermissionChecker from '../../../util/permissionChecker/PermissionChecker.jsx';
import MenuFormFields from '../formField/MenuFormFields.jsx';

const MenuDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const checkPermissions = usePermissionChecker();
  const isEditMenuPermission = checkPermissions('menu', 'edit');

  const isCreateMealPermission = checkPermissions('meal', 'create');
  const isViewMealPermission = checkPermissions('meal', 'view');


  const location = useLocation();
  const { menuData } = location.state || {};

  const [mealInput, setMealInput] = useState('');
  const [availableMeals, setavailableMeals] = useState(null);

  const [filteredMeals, setFilteredMeals] = useState([]);

  const [menu, setMenu] = useState({
    menuName: menuData?.name,
    selectedMeals: menuData?.meals,
  });
  const [selectedImage, setSelectedImage] = useState(Array.isArray(menuData.image) ? menuData.image : [menuData.image]);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  if (!menu) {
    return <p>Loading menu details...</p>;
  }

  useEffect(() => {
    const fetchMealsByVendorId = async () => {
      try {
        const response = await dispatch(mealsMiddleware.GetMealsByVendorId(menuData?.vendorId?._id));
        if (response?.success) {
          setavailableMeals(response?.meals);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    if (isViewMealPermission) fetchMealsByVendorId();

  }, [])



  const handleImageChange = (e) => {
    e.preventDefault();
    const file = Array.from(e.target.files);
    if (file.length > 0) {
      const imageFile = file[0];
      setSelectedImage(file);
      const objectUrl = URL.createObjectURL(imageFile);
      setImageUrl(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null)
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setMenu((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Handle meal search input
    if (name === "meals") {

      setMealInput(value);

      if (value.trim() === '') {
        setFilteredMeals([]);
        return;
      }

      if (availableMeals) {
        const filtered = availableMeals.filter((meal) =>
          meal.name && meal.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredMeals(filtered);
      }
    }
  };

  // Add the selected meal to the menu
  const handleAddToMenu = (selectedMeal) => {
    if (!selectedMeal) {
      dispatch(showWarningAlert("No result found for the searched meal"))
      return;
    }

    const { _id, name, image } = selectedMeal;

    // Check if the meal is already in the menu (menuData.Dishs)
    if (menu.selectedMeals.some(meal => meal._id === _id)) {
      dispatch(showWarningAlert("This meal is already in the menu."));
      setMealInput('');
      setFilteredMeals([]);
      return;
    }

    // Add the selected meal to menuData.Dishs
    setMenu(prevData => ({
      ...prevData,
      selectedMeals: [
        ...prevData.selectedMeals, // Retain previous dishes if any
        {
          _id: _id,
          name: name,
          image: image,
        }
      ]
    }));

    setMealInput('');
    setFilteredMeals([]);
  };

  // Remove a meal from the menu
  const handleRemoveFromMenu = (_id) => {
    setMenu((prevData) => ({
      ...prevData,
      selectedMeals: prevData.selectedMeals.filter(meal => meal._id !== _id),
    }));
  };

  // Clear all dishes from the menu
  const handleClearMenu = () => {
    setMenu((prevData) => ({
      ...prevData,
      selectedMeals: [],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (menu.selectedMeals.length === 0) {
      dispatch(showErrorAlert("Please add at least one meal to the menu."));
      return;
    }

    const mealIdsArray = [];
    menu.selectedMeals.map((meal, index) => {
      mealIdsArray.push(meal._id)
    });

    const formData = new FormData();
    formData.append('name', menu?.menuName);
    formData.append('meals', JSON.stringify(mealIdsArray));

    // Append the image file(s)
    if (selectedImage.length > 0) {
      for (const file of selectedImage) {
        formData.append('image', file)
      }
    }

    try {
      setIsLoading(true);
      const response = await dispatch(menusMiddleware.UpdateMenus(menuData?._id, formData));

      if (response.success) {
        console.log('Menu updated successfully:', response.data);
        navigate("/menus");
      }
    } catch (error) {
      console.error('Error updating menu:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // Handle cancel action
  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  if (isLoading) {
    return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
  }

  const vendor = [{
    value: menuData?.vendorId?._id,
    label: menuData?.vendorId?.name
  }]

  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Menu</h1>
        <CrossButton onClick={handleCancel} className="text-gray hover:text-gray-dark" />
      </div>

      <MenuFormFields
        menuData={menu}

        handleInputChange={handleInputChange}

        handleImageChange={handleImageChange}
        selectedImage={selectedImage}
        imageUrl={imageUrl}
        handleRemoveImage={handleRemoveImage}

        vendors={vendor}
        isVendorDisbaled={true}

        handleClearMenu={handleClearMenu}
        filteredMeals={filteredMeals}
        handleRemoveFromMenu={handleRemoveFromMenu}
        selectedVendorId={menuData?.vendorId?._id}

        type="edit"

        mealInput={mealInput}
        handleAddToMenu={handleAddToMenu}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default MenuDetails;
