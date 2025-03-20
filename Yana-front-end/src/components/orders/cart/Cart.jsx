import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import trash from "../../../assets/trash-white.svg";
import cart from "../../../assets/cart.svg";
import CustomInput from '../../../elements/customInput/CustomInput.jsx';
import OrderCard from '../orderscard/Orderscard.jsx';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware.js';
import MealsDeleteModal from "../../../components/meals/mealsDeleteModal/MealsDeleteModal.jsx";
import vendorsMiddleware from '../../../redux/middleware/vendorsMiddleware.js';

const Cart = ({ setOrder, Order, cartItems, setCartItems, TotalUnits, setTotalUnits }) => {
  const dispatch = useDispatch();

  const [meals, setmeals] = useState([])
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [mealInput, setMealInput] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isDeleteModalOpen, setisDeleteModalOpen] = useState(false);

  const [mealDetails, setmealDetails] = useState([])

  const [vendors, setvendors] = useState([]);
  const [selectedVendorId, setselectedVendorId] = useState(cartItems[0]?.vendorId);

  useEffect(() => {
    const fetchMealsAndVendors = async () => {
      try {
        const mealsResponse = await dispatch(mealsMiddleware.GetAllMeals());
        setmeals(mealsResponse.data);
        const vendorsResponse = await dispatch(vendorsMiddleware.GetAllVendors());
        setvendors(vendorsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchMealsAndVendors();
  }, []);



  useEffect(() => {
    const clearCart = () => {
      setCartItems([]); // Clear the cart items
      setOrder(prevOrder => ({
        ...prevOrder,
        mealIDsList: [] // Reset the DishIDsList
      }));
      setMealInput(''); // Reset meal input field
      setFilteredMeals([]); // Clear filtered meals
      setSelectedMeal(null); // Deselect any selected meal
    };

    if (selectedVendorId) {
      clearCart(); // Clear the cart when a new vendor is selected
    }
  }, [selectedVendorId]);




  useEffect(() => {
    if (Order && Order.mealIDsList && Order.mealIDsList.length > 0) {
      const existingDishes = Order.mealIDsList.map(dish => {
        const meal = meals.find(m => m._id === dish.mealId);
        if (meal) {
          return {
            id: meal._id.toString(),
            name: meal.title,
            image: meal.image,
            count: dish.Count,
            price: meal.price,
            vendorId: dish.vendorId
          };
        }
        return null;
      }).filter(Boolean);

      setCartItems(existingDishes);
    }
  }, [Order, meals]);

  const handleInputChange = (e) => {

    const { name, value } = e.target;
    // setOrder((prev) => ({ ...prev, [name]: value }));

    if (name === 'meals') {
      setMealInput(value);

      if (selectedVendorId && value.trim()) {
        setFilteredMeals(
          meals.filter(
            (meal) =>
              meal.title.toLowerCase().includes(value.toLowerCase()) &&
              meal.vendorId === selectedVendorId
          )
        );
      } else {
        setFilteredMeals([]);
      }
    }
  };
  useEffect(() => {
    if (cartItems.length > 0) {
      setselectedVendorId(cartItems[0]?.vendorId); // Set the vendor based on the first item in the cart
    }
    const TotalUnits = cartItems.reduce((total, item) => total + item.count, 0);
    setTotalUnits(TotalUnits)
  }, [cartItems]);

  useEffect(() => {
    if (!selectedVendorId) {
      // Reset meals and inputs if no vendor is selected
      setMealInput('');
      setFilteredMeals([]);
      setSelectedMeal(null);
    }
  }, [selectedVendorId]);

  const handleMealSelect = (meal) => {
    if (meal.vendorId === selectedVendorId) {
      setSelectedMeal(meal);
      setMealInput(meal.title);
      setFilteredMeals([]);
    }
  };

  const handleAddToCart = () => {
    if (selectedMeal && selectedMeal.vendorId === selectedVendorId) {
      const mealWithDetails = {
        id: selectedMeal._id,
        name: selectedMeal.title,
        image: selectedMeal.image,
        count: 1,
        price: selectedMeal.price,
        vendorId: selectedMeal.vendorId,
      };

      setCartItems((prevCart) => {
        const existingMealIndex = prevCart.findIndex(
          (item) => item.id === mealWithDetails.id
        );

        let updatedCart;
        if (existingMealIndex >= 0) {
          updatedCart = [...prevCart];
          updatedCart[existingMealIndex].count += 1;
        } else {
          updatedCart = [...prevCart, mealWithDetails];
        }
        const updatedDishIDsList = updatedCart.map((item) => ({
          mealId: item.id,
          mealName: item.name,
          Count: item.count,
          vendorId: item.vendorId,
        }));

        setOrder((prevOrder) => ({
          ...prevOrder,
          mealIDsList: updatedDishIDsList,
        }));

        return updatedCart;
      });

      setSelectedMeal(null);
      setMealInput('');
    }
  };


  const handleRemoveFromCart = (e) => {
    e.preventDefault();
    setCartItems(prevCart => {
      const updatedCart = prevCart.filter(item => item.id !== mealDetails.mealId);
      // Update Order.DishIDsList accordingly
      setOrder(prevOrder => ({
        ...prevOrder,
        mealIDsList: prevOrder.mealIDsList.filter(dish => dish.mealId !== mealDetails.mealId),
      }));
      return updatedCart;
    });
    setisDeleteModalOpen(false); // Close the modal
  };


  const handleDeleteClick = (item, e) => {
    e.preventDefault();
    const mealId = item.id;
    const image = item.image;
    const title = item.name;
    setmealDetails({ title, image, mealId });
    setisDeleteModalOpen(true); // Open Delete modal
  };

  const clearCart = () => {
    setCartItems([]); // Clear the cart items
    setOrder(prevOrder => ({
      ...prevOrder,
      mealIDsList: [] // Reset the DishIDsList
    }));
  };


  const handleIncrementCount = (mealName, e) => {
    e.preventDefault();
    setCartItems(prevCart =>
      prevCart.map(item => {
        if (item.name === mealName) {
          const newCount = Math.min(item.count + 1, 7);
          // Update Order.DishIDsList accordingly
          setOrder(prevOrder => {
            const updatedDishIDsList = prevOrder.mealIDsList.map(dish =>
              dish.mealId === item.id ? { ...dish, Count: newCount } : dish
            );
            return { ...prevOrder, mealIDsList: updatedDishIDsList };
          });
          return { ...item, count: newCount };
        }
        return item;
      })
    );
  };

  const handleDecrementCount = (mealName, e) => {
    e.preventDefault();
    setCartItems(prevCart =>
      prevCart.map(item => {
        if (item.name === mealName && item.count > 1) {
          const newCount = item.count - 1;
          // Update Order.DishIDsList accordingly
          setOrder(prevOrder => {
            const updatedDishIDsList = prevOrder.mealIDsList.map(dish =>
              dish.mealId === item.id ? { ...dish, Count: newCount } : dish
            );
            return { ...prevOrder, mealIDsList: updatedDishIDsList };
          });
          return { ...item, count: newCount };
        }
        return item;
      })
    );
  };


  return (

    <div>
      <h1 className='py-1 font-semibold text-2xl'>Cart <span className='text-red-600'>*</span></h1>
      {/* Meal Search Section */}
      <div className="relative w-full">

        <div className='flex gap-5 '>

          <div className='relative w-full'>
            <div className="flex py-3">
              <h1 className="w-40 py-1 font-semibold flex-shrink-0">Search Meal Item <span className='text-red-600'>*</span></h1>
              <div className="flex-grow">
                <CustomInput
                  id="Meals"
                  name="meals"
                  placeholder="Pasta..."
                  value={mealInput}
                  onChange={handleInputChange}
                  className="w-full"
                />

                {filteredMeals.length > 0 && (
                  <ul className="absolute bg-white border border-gray-300 rounded-md shadow-lg max-h-[200px] overflow-y-auto min-w-[100%]">
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
                        <span className='px-3 font-thin '>{meal.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full py-3 items-center">
            <h2 className='w-40 items-center font-semibold'>Vendor <span className='text-red-600'>*</span></h2>
            <select
              name="vendor"
              value={selectedVendorId || ""}
              onChange={(e) => {
                setCartItems([])
                setselectedVendorId(e.target.value);
              }}
              // required
              className="px-2 flex-grow py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100"
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
        <div className='flex w-full gap-2 py-3 justify-center'>
          <div className='flex'>
            <ButtonWithIcon
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              icon={<img src={cart} alt="cart" width={20} height={20} />}
              text="Add to cart"
              className="bg-custom-blue text-white px-3 py-2 rounded-full"
            />
            <ButtonWithIcon
              onClick={(e) => {
                e.preventDefault();
                clearCart();
              }}
              icon={<img src={trash} alt="cart" width={20} height={20} />}
              text="Clear cart"
              className="min-w-[130px] ml-4 bg-red-600 border text-white px-3 py-1 rounded-full text-lg mx-auto flex items-center justify-center "
            />
          </div>
        </div>
      </div>


      <div className="flex w-full py-3 ">
        <h2 className="w-40 text-lg font-semibold mb-2 flex-shrink-0">Cart Items</h2>
        {/* Cart Display Section */}
        <div className="bg-blue-50 w-full h-64 p-4 overflow-y-auto">
          {/* <h2 className="text-lg font-semibold mb-2">Cart Items</h2> */}

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {cartItems.map((item, index) => (
                <div key={index} className="py-1">
                  <OrderCard
                    name={item.name}
                    count={item.count}
                    imgPath={item.image}
                    onIncrement={(e) => handleIncrementCount(item.name, e)}
                    onDecrement={(e) => handleDecrementCount(item.name, e)}
                    // onRemove={(e) => handleRemoveFromCart(item.id, e)}
                    onRemove={(e) => handleDeleteClick(item, e)}
                  />
                </div>
              ))}
            </div>
          ) : (

            <div className='flex items-center justify-center' >
              <img src='/empty_cart.svg' width={200} height={200} />
            </div>
          )}

        </div>
      </div>

      <div className="flex justify-between mt-2">
        <div></div>
        <span>Total Items: {cartItems.reduce((acc, item) => acc + item.count, 0)}</span>
      </div>
      {
        isDeleteModalOpen && (
          <MealsDeleteModal
            meal={mealDetails}
            onConfirm={(e) => handleRemoveFromCart(e)}
            onCancel={(e) => setisDeleteModalOpen(false)}
          />
        )
      }
    </div>

  );
};

export default Cart;
