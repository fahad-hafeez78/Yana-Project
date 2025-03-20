import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CustomInput from '../../../elements/customInput/CustomInput.jsx';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import trash from "../../../assets/trash-white.svg";
import trashred from "../../../assets/trash.svg";
import menuicon from "../../../assets/menu.svg";
import { useDispatch } from 'react-redux';
import menusMiddleware from '../../../redux/middleware/menusMiddleware.js';
import { showErrorAlert, showWarningAlert } from '../../../redux/actions/alertActions.js';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import AddMealIcon from '../../../assets/plus-circle-white.svg';
import ImageIcon from "../../../assets/customIcons/generalIcons/ImageIcon.svg?react"

const MenuDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch()


  const location = useLocation();
  const [mealInput, setMealInput] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null); // New state for the selected meal
  const [filteredMeals, setFilteredMeals] = useState([]);
  const { menuData, mealsData } = location.state || {};

  const [menu, setMenu] = useState(menuData)
  const [selectedImage, setSelectedImage] = useState(Array.isArray(menuData.image) ? menuData.image : [menuData.image]);
  const [imageUrl, setImageUrl] = useState(null);

  if (!menu) {
    return <p>Loading menu details...</p>;
  }

  const handleImageChange = (e) => {
    // const file = Array.from(e.target.files);  // Convert FileList to an array
    // setSelectedImage(file);

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

    if (name === 'Meals') {
      setMealInput(value);
      const filteredMealsList = mealsData.filter((meal) =>
        meal.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMeals(filteredMealsList);
    }
    // Handle meal search input
    // if (name === "Meals") {
    //   // setMealInput(value);

    //   if (mealsData) {
    //     const filtered = mealsData.filter((meal) =>
    //       // Check if DishName is a valid string and then perform toLowerCase
    //       meal.DishName && meal.DishName.toLowerCase().includes(value.toLowerCase())
    //     );
    //     setFilteredMeals(filtered);
    //   }
    // }
  };


  // Handle meal selection
  const handleMealSelect = (meal) => {
    setSelectedMeal(meal); // Store the selected meal
    setMealInput(meal.title); // Update the meal input field with the selected dish's name
    setFilteredMeals([]); // Clear the filtered meals list
  };

  // Add the selected meal to the menu
  // const handleAddToMenus = () => {
  //   if (!selectedMeal) {
  //     // alert("Please select a meal before adding it to the menu.");
  //     dispatch(showWarningAlert("Please select a meal before adding it to the menu."))
  //     return;
  //   }

  //   const { _id, DishName, DishPhotoPath } = selectedMeal;

  //   // Check if the dish is already in the menu (menuData.Dishs)
  //   if (menu.Dishes.some(dish => dish._id === _id)) {
  //     // alert("This dish is already in the menu.");
  //     dispatch(showWarningAlert("This dish is already in the menu."))

  //     setMealInput('');
  //     return;
  //   }

  //   // Add the selected dish to menuData.Dishs
  //   setMenu(prevData => ({
  //     ...prevData,
  //     Dishes: [
  //       ...prevData.Dishes, // Retain previous dishes if any
  //       {
  //         _id: _id,
  //         name: DishName,
  //         image: DishPhotoPath,
  //       }
  //     ]
  //   }));

  //   setMealInput('');
  //   setSelectedMeal(null);
  // };
  const handleAddToMenu = () => {
    if (!selectedMeal) {
      alert("Please select a meal before adding it to the menu.");
      return;
    }
    if (menu.meals.some(meal => meal._id === selectedMeal._id)) {
      alert("This dish is already in the menu.");
      setMealInput('');
      return;
    }

    if (selectedMeal) {
      setMenu((prevState) => ({
        ...prevState,
        meals: [...prevState.meals, selectedMeal],
      }));
      setSelectedMeal(null);
      setMealInput(""); // Clear the meal search input
    }
  };
  // Remove a dish from the menu
  const handleRemoveFromMenu = (_id) => {
    setMenu((prevData) => ({
      ...prevData,
      meals: prevData.meals.filter(dish => dish._id !== _id), // Remove dish based on _id
    }));
  };

  // Clear all dishes from the menu
  const handleClearMenu = () => {
    setMenu((prevData) => ({
      ...prevData,
      meals: [], // Reset the dishes to an empty array
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();


    if (menu.meals.length === 0) {
      dispatch(showErrorAlert("Please add at least one meal to the menu."));
      return;
    }
    // Create FormData instance
    const formData = new FormData();
    // formData.append('MenuName', menu.MenuName);
    formData.append('name', menu.name);

    menu.meals.forEach((meal, index) => {
      formData.append(`meals[${index}][_id]`, meal._id);
    });

    // formData.append('_id', menu._id);


    // // Append each dish
    // menu.Dishes.forEach((dish, index) => {
    //   formData.append(`Dishes[${index}][_id]`, dish._id);
    //   formData.append(`Dishes[${index}][name]`, dish.name);
    //   formData.append(`Dishes[${index}][image]`, dish.image);
    // });

    // Append the image file(s)
    if (selectedImage.length > 0) {
      for (const file of selectedImage) {
        formData.append('imagefile', file)
      }
    }

    try {
      // Dispatch the formData for updating the menu
      const response = await dispatch(menusMiddleware.UpdateMenus(menu._id, formData));

      if (response.success) {
        navigate("/menus");
      } else {
      }
    } catch (error) {
      console.error('Error updating menu:', error);
    }
  };



  // Handle cancel action
  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };


  return (
    // <div className="container">
    <div className='flex flex-col bg-white p-5 rounded-2xl shadow-md gap-2'>
      <h1 className="text-[#959595] font-bold text-2xl">Edit Menu</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2'>

        <div className='flex flex-col px-2 h-[calc(100vh-230px)] overflow-y-auto gap-3'>
          <div className='flex gap-5'>
            <div className="flex w-full items-center py-2">
              <label htmlFor="MenuName" className="w-40 py-1 font-semibold flex-shrink-0">Menu Name <span className='text-red-600'>*</span></label>
              <div className='flex-grow'>
                <CustomInput
                  id="MenuName"
                  name="name"
                  value={menu.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="flex w-full items-center py-2 gap-2">
              <p className="font-semibold flex-shrink-0">Menu image <span className='text-red-600'>*</span></p>

              <div className='flex'>
                <div className="relative inline-block border border-gray-300 rounded-md p-1 mr-2">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    // multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 py-1"
                  />
                  <span className="text-gray-700">Choose Files</span>
                </div>

                <span className="text-gray-700 flex items-center">
                  {selectedImage?.length > 0
                    ?
                    // selectedImage?.map((image) => {
                    //   const fileName = typeof image === 'string'
                    //     ? image.split('/').pop().replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-/, '') // Remove timestamp
                    //     : image.name;
                    //   return <span key={fileName}>{fileName}</span>;
                    // })
                    <ImageIcon className="cursor-pointer" onClick={() => window.open(imageUrl || selectedImage, '_blank')} />
                    : 'No file selected'}
                  {selectedImage?.length > 0 &&
                    <CrossButton className='w-8 h-8' onClick={() => handleRemoveImage()} />
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            <div className="flex w-full">
              <h1 className="py-1 font-semibold flex-shrink-0 w-40">Search Meal Item</h1>
              <div className="flex-grow">
                <CustomInput
                  id="Meals"
                  name="Meals"
                  placeholder="Pasta..."
                  value={mealInput}
                  onChange={handleInputChange}
                  className="w-full"
                />

                {filteredMeals.length > 0 && (
                  <ul className="mt-1 h-40 overflow-y-auto border border-gray-300 rounded-md">
                    {filteredMeals.map((meal, index) => (
                      <li
                        key={index}
                        onClick={() => handleMealSelect(meal)}
                        className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <img
                          src={meal.image}
                          alt={meal.title}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                        <span className='px-3 font-thin'>{meal.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className='flex w-full justify-center pt-1'>
            <div className='flex gap-2'>
              <ButtonWithIcon
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToMenu();
                }}
                icon={<img src={menuicon} alt="menu" width={20} height={20} className="invert" />}
                text="Add to Menu"
                className="bg-custom-blue text-white px-3 py-2 rounded-full min-w-[138px]"
              />
              <ButtonWithIcon
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/meals/addmeals');
                }}
                icon={<img src={AddMealIcon} alt="Add Meal" width={24} height={24} />}
                text="Add New Meal"
                className="bg-custom-blue text-white px-3 py-2 rounded-full"
              />
              <ButtonWithIcon
                onClick={(e) => {
                  e.preventDefault();
                  handleClearMenu();
                }}
                icon={<img src={trash} alt="cart" width={20} height={20} />}
                text="Clear Menu"
                className="bg-red-600 border text-white min-w-[138px] px-3 py-2 rounded-full text-lg mx-auto flex items-center justify-center "
              />
            </div>
          </div>


          {/* Menu Display Section */}
          <div className="flex w-full py-2 ">
            <h2 className="text-lg font-semibold mb-2 w-40 flex-shrink-0">Meals</h2>
            <div className="bg-blue-50 w-full h-50 p-4 overflow-y-auto">
              {menu.meals.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {menu.meals.map((dish, index) => (
                    <div key={dish._id} className="py-1 bg-white p-4 rounded-lg shadow-md">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{dish.title}</span>
                        <ButtonWithIcon
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFromMenu(dish._id); // Remove the dish from the menu
                          }}
                          icon={<img src={trashred} alt="cart" width={16} height={16} />}
                          className="text-red-600 hover:text-red-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex items-center justify-center' >
                  <img src='/empty_menu.svg' width={200} height={200} />
                </div>
              )}
            </div>

          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-center gap-2 pt-1">
          <ButtonWithIcon
            type="button"
            onClick={handleCancel}
            text="Discard"
            className="bg-red-600 text-white px-3 py-2 rounded-full min-w-[138px]"
          />
          <ButtonWithIcon
            type="submit"
            text="Save"
            className="bg-custom-blue text-white px-3 py-2 rounded-full min-w-[138px]"
          />
        </div>
      </form>
    </div>
    // </div>
  );
};

export default MenuDetails;
