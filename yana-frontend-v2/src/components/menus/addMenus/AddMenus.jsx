import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import menusMiddleware from '../../../redux/middleware/menusMiddleware.js';
import { useDispatch } from 'react-redux';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import { showErrorAlert, showWarningAlert } from '../../../redux/actions/alertActions.js';
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware.js';
import vendorsMiddleware from '../../../redux/middleware/vendorsMiddleware.js';
import Spinner from '../../../elements/customSpinner/Spinner.jsx';
import usePermissionChecker from '../../../util/permissionChecker/PermissionChecker.jsx';
import MenuFormFields from '../formField/MenuFormFields.jsx';


const AddMenus = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const checkPermission = usePermissionChecker();
  const isVendorViewPermission = checkPermission('vendor', 'view');
  const isMealViewPermission = checkPermission('meal', 'view');

  const [vendors, setvendors] = useState([]);
  const [selectedVendorId, setselectedVendorId] = useState(null);

  const [mealInput, setMealInput] = useState('');
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [mealsData, setmealsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state to store menu data
  const [menuData, setMenuData] = useState({
    menuName: "",
    selectedMeals: [],
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await dispatch(vendorsMiddleware.GetAllVendors("active"));
        const options = response?.vendors?.map(role => ({
          value: role._id,
          label: role.name,
        }));
        setvendors([{ value: "", label: "Select" }, ...options]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (isVendorViewPermission) fetchVendors();
  }, [])

  const fetchMealsByVendorId = async (vendorId) => {
    try {
      const response = await dispatch(mealsMiddleware.GetMealsByVendorId(vendorId));
      if (response?.success) {
        setmealsData(response?.meals);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

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

  const handleSelectVendor = (e) => {
    e.preventDefault();

    setMenuData(prevData => ({
      ...prevData,
      selectedMeals: []
    }));

    if (e.target.value === 'Select' || e.target.value === null) {
      setselectedVendorId(null);
      setFilteredMeals([]);
      setMealInput('');
    }
    else {
      setMealInput('');
      setFilteredMeals([]);
      setselectedVendorId(e.target.value);
      if (isMealViewPermission) fetchMealsByVendorId(e.target.value);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setMenuData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Handle meal search input
    if (name === "meals") {

      if (selectedVendorId === null) {
        dispatch(showWarningAlert("Select vendor first"))
      }

      else {
        setMealInput(value);
        if (value.trim() === '') {
          setFilteredMeals([]);
          return;
        }

        if (mealsData) {
          const filtered = mealsData.filter((meal) =>
            meal.name && meal.name.toLowerCase().includes(value.toLowerCase())
          );
          setFilteredMeals(filtered);
        }
      }
    }
  };

  // Add the selected meal to the menu
  const handleAddToMenu = (selectedMeal) => {
    if (!selectedMeal) {
      dispatch(showWarningAlert("No result found for the searched meal"));
      return;
    }
    const { _id, name, image } = selectedMeal;

    // Check if the dish is already in the menu (menuData.Dishs)
    if (menuData.selectedMeals.some(dish => dish._id === _id)) {
      dispatch(showWarningAlert("This meal is already in the menu."))
      setMealInput('');
      setFilteredMeals([]);
      return;
    }

    setMenuData(prevData => ({
      ...prevData,
      selectedMeals: [
        ...prevData.selectedMeals,
        {
          _id: _id,
          name: name,
          image: image
        }
      ]
    }));

    setMealInput('');
    setFilteredMeals([]);
  };

  // Remove a dish from the menu
  const handleRemoveFromMenu = (_id) => {
    setMenuData((prevData) => ({
      ...prevData,
      selectedMeals: prevData.selectedMeals.filter(dish => dish._id !== _id), // Remove dish based on _id
    }));
  };

  // Clear all dishes from the menu
  const handleClearMenu = () => {
    setMenuData((prevData) => ({
      ...prevData,
      selectedMeals: [], // Reset the dishes to an empty array
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!menuData.selectedMeals.length) {
      dispatch(showErrorAlert('Please add meals to the menu.'));
      return;
    }
    const formData = new FormData();

    const mealIdsArray = [];
    menuData.selectedMeals.map((meal, index) => {
      mealIdsArray.push(meal._id)
    });

    formData.append('name', menuData?.menuName);
    formData.append('meals', JSON.stringify(mealIdsArray));
    formData.append('vendorId', selectedVendorId);

    // Append the image file
    if (selectedImage) {
      for (const file of selectedImage) {
        formData.append('image', file)
      }
    }

    try {
      setIsLoading(true);
      const response = await dispatch(menusMiddleware.CreateNewMenus(formData));

      if (response.success) {
        navigate("/menus");
      }
    } catch (error) {
      console.error('Error creating menu:', error);
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



  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Add Menu</h1>
        <CrossButton onClick={handleCancel} className="text-gray hover:text-gray-dark" />
      </div>

      <MenuFormFields
        menuData={menuData}

        handleInputChange={handleInputChange}

        handleImageChange={handleImageChange}
        selectedImage={selectedImage}
        imageUrl={imageUrl}
        handleRemoveImage={handleRemoveImage}

        vendors={vendors}
        handleSelectVendor={handleSelectVendor}

        handleClearMenu={handleClearMenu}
        filteredMeals={filteredMeals}
        handleRemoveFromMenu={handleRemoveFromMenu}
        selectedVendorId={selectedVendorId}

        mealInput={mealInput}
        handleAddToMenu={handleAddToMenu}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default AddMenus;