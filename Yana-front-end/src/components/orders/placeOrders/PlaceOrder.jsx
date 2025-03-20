import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CustomInput from '../../../elements/customInput/CustomInput.jsx';
import Cart from '../../orders/cart/Cart.jsx'
import ordersMiddleware from '../../../redux/middleware/ordersMiddleware.js';
import mealsMiddleware from '../../../redux/middleware/mealsMiddleware.js';
import customersMiddleware from '../../../redux/middleware/customersMiddleware.js';
import { showErrorAlert } from '../../../redux/actions/alertActions.js';
import SearchBar from '../../../elements/searchBar/SearchBar.jsx';
import search from "../../../assets/search.svg";

const PlaceOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [meals, setmeals] = useState([]);
  const [customers, setcustomers] = useState([]);

  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [mealInput, setMealInput] = useState('');

  const [TotalUnits, setTotalUnits] = useState(0)

  useEffect(() => {

    fetchCustomers();
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await dispatch(mealsMiddleware.GetAllMeals());
      setmeals(response.data)
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await dispatch(customersMiddleware.GetAllActiveCustomers());
      const activeCustomers = response.data.filter(customer => customer.Status === 'Active');

      setcustomers(activeCustomers)

    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const [newOrder, setNewOrder] = useState({
    name: '',
    meals: [],
    medicaidID: '',
    memberID: '',
    phone: '',
    address: {
      street1: "",
      street2: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
    },
    instructions: [],
  });

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
    setNewOrder((prevData) => ({
      ...prevData,
      [name]: formattedValue,  // Dynamically update the field specified by the name
    }));
  };

  const handleInstructionChange = (e) => {
    setMealInput(e.target.value);  // temporarily store the new instruction text
  };

  const handleAddInstruction = () => {
    if (mealInput.trim() !== "") {
      setNewOrder(prevOrder => ({
        ...prevOrder,
        instructions: [...prevOrder.instructions, mealInput], // Add the instruction to the array
      }));
      setMealInput(""); // Clear the input field after adding the instruction
    }
  };

  const handleRemoveInstruction = (index) => {
    const updatedInstructions = newOrder.instructions.filter((_, i) => i !== index);
    setNewOrder((prevState) => ({ ...prevState, instructions: updatedInstructions }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setNewOrder(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setNewOrder(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (name === 'meals') {
      setMealInput(value);
      setFilteredMeals(value.trim() ? meals.filter(meal => meal.title.toLowerCase().includes(value.toLowerCase())) : []);
    }
    if (name === 'name') {
      setFilteredCustomers(value.trim() ? customers.filter(customer => customer.Name.toLowerCase().includes(value.toLowerCase())) : []);
    }
  };


  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setNewOrder({
      name: customer.Name,
      medicaidID: customer.MedicaidID,
      memberID: customer.MemberID,
      phone: customer.Phone,
      address: {
        street1: customer.street1,
        street2: customer.street2,
        city: customer.city,
        state: customer.state,
        zipcode: customer.zipcode,
        country: customer.country,
      },
      instructions: []
    });
    setFilteredCustomers([]);
  };

  const placeOrder = async (orderToSubmit) => {
    try {
      const response = await dispatch(ordersMiddleware.PlaceNewOrder(orderToSubmit));
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, medicaidID, memberID, phone, address, instructions } = newOrder;
    if (!name || !medicaidID || !memberID || !phone || !address) {
      // alert("Please fill in all required fields.");
      dispatch(showErrorAlert("Please fill in all required fields."))
      return;
    }
    if (cartItems.length === 0) {
      dispatch(showErrorAlert("Please add meals to cart."))
      return;
    }
    const orderToSubmit = {
      participantId: selectedCustomer ? selectedCustomer._id.toString() : null,
      participantName: name,
      mealIDsList: cartItems.map(item => ({
        mealId: item.id,
        vendorId: item.vendorId,
        mealName: item.name,
        Count: item.count,
      })),
      DeliveryInstructions: instructions,
      OrderUnits: cartItems.reduce((total, item) => total + item.count, 0),
      OrderPlaceDateTime: new Date(),
      OrderCompleteDateTime: null,
      Phone: phone,
      Status: "Pending",
      DeliveryAddress: address,

    };
    placeOrder(orderToSubmit);
    navigate(-1);
  };

  const handleDiscardClicking = () => {
    navigate(-1);
  };

  return (
    <div className="p-5 bg-white w-full rounded-2xl">
      <h1 className="text-2xl font-bold ">Place Order</h1>
      <form className="bg-white py-6 rounded-lg w-full" onSubmit={handleSubmit}>
        <div className='h-[calc(100vh-220px)] overflow-y-auto'>
          <div className='border-b px-1'>

            <div className="relative w-full">
              <div className='flex gap-5'>
                <div className="flex w-full items-center">
                  <h1 className="w-40 py-1 font-semibold flex-shrink-0">Participant Name <span className="text-red-600">*</span></h1>
                  <div className="relative w-[100%] flex items-center">
                    <input
                      id="name"
                      name="name"
                      placeholder="Search name..."
                      value={newOrder.name}
                      onChange={handleInputChange}
                      required
                      className={`flex-grow py-1.5 pr-10 pl-1 border border-gray-300 rounded-md text-sm bg-gray-100 outline-none focus:border-gray-200 focus:ring-1 focus:ring-gray-500 w-full`}
                    />
                    <div className="flex-grow absolute right-2 flex items-center pointer-events-none">
                      <img src={search} alt="search" width={18} height={18} />
                    </div>
                  </div>
                  {filteredCustomers.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      {filteredCustomers.map((customer, index) => (
                        <li
                          key={index}
                          onClick={() => handleCustomerSelect(customer)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {customer.Name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>


                <div className='flex w-full  items-center py-2'>
                  <h1 className='w-40 py-1 font-semibold flex-shrink-0'>Phone Number <span className='text-red-600'>*</span></h1>
                  <div className='flex-grow'>
                    <CustomInput
                      id="phone"
                      name="phone"
                      type='tel'
                      placeholder="23423422"
                      value={newOrder.phone}
                      onChange={handlePhoneChange}
                      required
                      className="w-full "
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='flex gap-5'>
              <div className='flex w-full items-center py-2'>
                <h1 className='w-40 py-1 font-semibold flex-shrink-0'>Medical ID <span className='text-red-600'>*</span></h1>
                <div className='flex-grow'>
                  <CustomInput
                    id="MedicaidID"
                    name="medicaidID"
                    placeholder="234234"
                    value={newOrder.medicaidID}
                    onChange={handleInputChange}
                    readOnly
                    className="w-full"
                  />
                </div>
              </div>

              <div className='flex w-full items-center py-2'>
                <h1 className='w-40 py-1 font-semibold flex-shrink-0'>Insurance ID <span className='text-red-600'>*</span></h1>
                <div className='flex-grow'>
                  <CustomInput
                    id="InsuranceID"
                    name="memberID"
                    placeholder="234234"
                    value={newOrder.memberID}
                    onChange={handleInputChange}
                    readOnly
                    className="w-full"
                  />
                </div>
              </div>
            </div>



            <div className='flex gap-5'>
              <div className='flex w-full items-center py-2'>
                <h1 className='w-40 py-1 font-semibold flex-shrink-0'>Street Line1 <span className='text-red-600'>*</span></h1>
                <div className='flex-grow'>
                  <CustomInput
                    id="street1"
                    name="address.street1"
                    placeholder="234234"
                    value={newOrder.address.street1}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className='flex w-full items-center py-2'>
                <h1 className='w-40 py-1 font-semibold flex-shrink-0'>Street Line2</h1>
                <div className='flex-grow'>
                  <CustomInput
                    id="street2"
                    name="address.street2"
                    placeholder="(Apt, Unit, etc.)"
                    value={newOrder.address.street2}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className='flex gap-5'>
              <div className='flex w-full items-center py-2'>
                <h1 className='w-40 py-1 font-semibold flex-shrink-0'>City <span className='text-red-600'>*</span></h1>
                <div className='flex-grow'>
                  <CustomInput
                    id="city"
                    name="address.city"
                    placeholder="New York"
                    value={newOrder.address.city}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className='flex w-full items-center py-2'>
                <h1 className='w-40 py-1 font-semibold flex-shrink-0'>State <span className='text-red-600'>*</span></h1>
                <div className='flex-grow'>
                  <CustomInput
                    id="state"
                    name="address.state"
                    placeholder="New York"
                    value={newOrder.address.state}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className='flex gap-5'>
              <div className='flex w-full items-center py-2'>
                <h1 className='w-40 py-1 font-semibold flex-shrink-0'>Zipcode <span className='text-red-600'>*</span></h1>
                <div className='flex-grow'>
                  <CustomInput
                    id="zipcode"
                    name="address.zipcode"
                    placeholder="New York"
                    value={newOrder.address.zipcode}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className='flex w-full items-center py-2'>
                {/* <h1 className='w-40 py-1 font-semibold flex-shrink-0'>Country <span className='text-red-600'>*</span></h1>
                <div className='flex-grow'>
                  <CustomInput
                    id="country"
                    name="address.country"
                    placeholder="New York"
                    value={newOrder.address.country}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div> */}
              </div>
            </div>

            <div className="flex w-full items-center py-2">
              <h1 className="w-40 font-semibold flex-shrink-0">Delivery Instructions</h1>

              <div className='flex w-full gap-4'>
                <div className="flex-grow">
                  <CustomInput
                    id="Instructions"
                    name="instructions"
                    placeholder="Low Spice level..."
                    value={mealInput}
                    onChange={handleInstructionChange}
                    className="w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="bg-custom-blue border text-white px-2 py-1 rounded-full text-lg flex items-center justify-center"
                >
                  Add Instruction
                </button>
              </div>

            </div>

            {/* Display the list of added instructions */}
            {newOrder.instructions.length > 0 && (
              <div className="py-2 flex flex-wrap gap-2">
                {newOrder.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-center gap-2 p-1 px-2 bg-blue-50 rounded-full w-fit">
                    <span className="text-sm text-black">{instruction}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-grow px-1">
            <Cart setOrder={setNewOrder} Order={newOrder} cartItems={cartItems} setCartItems={setCartItems} TotalUnits={TotalUnits} setTotalUnits={setTotalUnits} />
          </div>

          <div className="flex space-x-2 m-4 justify-center">
            <button
              onClick={handleDiscardClicking}
              className="bg-red-600 border text-white min-w-[130px] px-3 py-1 rounded-full text-lg flex items-center justify-center"
            >
              Discard
            </button>

            <button
              type="submit"
              className="bg-custom-blue border text-white min-w-[130px] px-3 py-1 rounded-full text-lg flex items-center justify-center"
            >
              Checkout
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrders;