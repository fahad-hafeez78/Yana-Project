import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CustomInput from '../../../elements/customInput/CustomInput.jsx';
import Cart from '../../orders/cart/Cart.jsx'
import ordersMiddleware from '../../../redux/middleware/ordersMiddleware.js';
import customersMiddleware from '../../../redux/middleware/customersMiddleware.js';
import { showErrorAlert } from '../../../redux/actions/alertActions.js';
import search from "../../../assets/customIcons/generalIcons/search.svg";
import Spinner from '../../../elements/customSpinner/Spinner.jsx';
import usePhoneFormatter from '../../../util/phoneFormatter/phoneFormatter.jsx';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon.jsx';

const PlaceOrders = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [activeCustomers, setActiveCustomers] = useState([]);

    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [instructionsInput, setInstructionsInput] = useState('');

    const [orderFields, setOrderFields] = useState({
        name: '',
        phone: '',
        status: '',
        address: {
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
        },
        deliveryInstructions: [],
        mealsList: [],
        totalOrderUnits: ''
    })

    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await dispatch(customersMiddleware.GetAllCustomers('active'));
            setActiveCustomers(response?.customers)

        } catch (error) {
            console.error("Error fetching activeCustomers:", error);
        }
    };

    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = usePhoneFormatter(value);

        // Update the specific phone field based on the input's name attribute
        setOrderFields((prevData) => ({
            ...prevData,
            [name]: formattedValue,  // Dynamically update the field specified by the name
        }));
    };

    const handleInstructionChange = (e) => {
        setInstructionsInput(e.target.value);
    };
    const handleAddInstruction = () => {
        if (instructionsInput.trim()) {
            setOrderFields((prevDetails) => ({
                ...prevDetails,
                deliveryInstructions: [
                    ...(prevDetails.deliveryInstructions || []),
                    instructionsInput
                ],
            }));
            setInstructionsInput("");
        }
    };

    const handleRemoveInstruction = (index) => {
        const updatedInstructions = orderFields?.deliveryInstructions?.filter((_, i) => i !== index);
        setOrderFields((prevState) => ({ ...prevState, deliveryInstructions: updatedInstructions }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const addressField = name.split(".")[1];
            setOrderFields(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
        } else {
            setOrderFields(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (name === 'name') {

            const checkParticipant = value.trim() ? activeCustomers.filter(customer => customer.name.toLowerCase().includes(value.toLowerCase())) : [];

            setFilteredCustomers(checkParticipant);

            if (checkParticipant.length === 0) {

                setOrderFields({
                    name: value,  // Keep the current name input
                    phone: '',
                    address: {
                        street1: '',
                        street2: '',
                        city: '',
                        state: '',
                        zip: '',
                    },
                    deliveryInstructions: [],
                    mealsList: [],
                    totalOrderUnits: ''
                });
                setSelectedCustomer(null);
            }
        }
    };

    const handleCustomerSelect = (customer) => {
        setOrderFields({
            name: customer.name,
            phone: customer.phone,
            address: {
                street1: customer.address.street1,
                street2: customer.address.street2,
                city: customer.address.city,
                state: customer.address.state,
                zip: customer.address.zip,
            },
        });
        setSelectedCustomer(customer);
        setFilteredCustomers([]);
    };

    const placeOrder = async (orderToSubmit) => {
        try {
            setIsLoading(true)
            const response = await dispatch(ordersMiddleware.PlaceNewOrder(orderToSubmit));
            if (response?.success) {
                navigate(-1);
            }
        } catch (error) {
            console.error("Error fetching activeCustomers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedCustomer?.memberId === undefined || selectedCustomer?.medicaidId === undefined) {
            dispatch(showErrorAlert("Customer Does Not exist"));
            return;
        }
        if (orderFields?.phone.length < 14) {
            dispatch(showErrorAlert("Enter Valid Phone number"));
            return;
        }

        const { mealsList, totalOrderUnits } = orderFields;

        if (mealsList?.length === 0 || totalOrderUnits === 0 || mealsList === undefined) {
            dispatch(showErrorAlert("Please add meals to cart."));
            return;
        }

        const updatedMealBody = {
            meals: orderFields?.mealsList?.map(item => ({
                meal: item?.meal?._id,
                vendorId: item?.vendorId?._id,
                quantity: item?.quantity,
            })),
        };
        const updatedOrderBody = {
            "customer": selectedCustomer?._id,
            "phone": orderFields?.phone,
            "meals": updatedMealBody?.meals,
            "instructions": orderFields?.deliveryInstructions,
            "delivery_location": orderFields?.address,
            "status": "pending",
            "order_units": orderFields?.totalOrderUnits,
        }
        if (orderFields?.totalOrderUnits === 0) {
            dispatch(showErrorAlert("Please add meals to cart."))
            return;
        }

        placeOrder(updatedOrderBody);
    };

    const handleDiscardClicking = (e) => {
        e.preventDefault();
        navigate(-1);
    };

    if (isLoading) {
        return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
    }

    return (
        <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Place Order</h1>

            <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                {/* Scrollable content area */}
                <div className="flex-grow overflow-y-auto">
                    <div className="border-b px-1 pb-4">
                        {/* Participant Name and Phone Number Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="name" className="block font-semibold">
                                    Participant Name <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="name"
                                        name="name"
                                        autoComplete='off'
                                        placeholder="Search name..."
                                        value={orderFields?.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full py-1 pr-10 pl-1 border border-gray-light rounded-md bg-gray-100 outline-none focus:border-gray-200 focus:ring-1 focus:ring-gray"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <img src={search} alt="search" width={18} height={18} />
                                    </div>
                                    {filteredCustomers.length > 0 && (
                                        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-light rounded-md shadow-lg z-10 max-h-[200px] overflow-y-auto">
                                            {filteredCustomers.map((customer, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => handleCustomerSelect(customer)}
                                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                >
                                                    {customer.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <CustomInput
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                required
                                placeholder="(123) 456-7890"
                                value={orderFields?.phone}
                                onChange={handlePhoneChange}
                            />
                        </div>

                        {/* Medical ID and Member ID Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                            <CustomInput
                                label="Medical ID"
                                name="medicaidID"
                                placeholder="Medical ID"
                                value={selectedCustomer?.medicaidId || ''}
                                readOnly
                            />
                            <CustomInput
                                label="Member ID"
                                name="memberID"
                                placeholder="Member ID"
                                value={selectedCustomer?.memberId || ''}
                                readOnly
                            />
                        </div>

                        {/* Address Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-dark">Address Information</h2>

                            {/* Street Address Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    label="Street Line 1"
                                    name="address.street1"
                                    placeholder="123 Main St"
                                    value={orderFields.address.street1}
                                    validationKey="street"
                                    onChange={handleInputChange}
                                    required
                                />
                                <CustomInput
                                    label=" Street Line 2"
                                    name="address.street2"
                                    placeholder="(Apt, Unit, etc.)"
                                    value={orderFields.address.street2}
                                    validationKey="street"
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* City and State Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    label="City"
                                    name="address.city"
                                    placeholder="New York"
                                    value={orderFields.address.city}
                                    onChange={handleInputChange}
                                    validationKey="cityorstate"
                                    required
                                />
                                <CustomInput
                                    label="State"
                                    name="address.state"
                                    placeholder="NY"
                                    value={orderFields.address.state}
                                    onChange={handleInputChange}
                                    required
                                    validationKey="cityorstate"
                                />
                            </div>

                            {/* Zip Code Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    label="Zip code"
                                    name="address.zip"
                                    placeholder="10001"
                                    value={orderFields.address.zip}
                                    onChange={handleInputChange}
                                    minLength={3}
                                    maxLength={10}
                                    required
                                />
                                <div></div> {/* Empty div for grid alignment */}
                            </div>
                        </div>

                        {/* Delivery Instructions */}
                        <div className="mt-4">
                            <label htmlFor="Instructions" className="block font-semibold mb-1">
                                Delivery Instructions
                            </label>
                            <div className="flex gap-4">
                                <div className="flex-grow">
                                    <CustomInput
                                        id="Instructions"
                                        name="instructions"
                                        placeholder="Low Spice level..."
                                        value={instructionsInput}
                                        onChange={handleInstructionChange}
                                    />
                                </div>
                                <ButtonWithIcon
                                    type="button"
                                    text="Add Instruction"
                                    variant='primary'
                                    className='py-0 px-1'
                                    onClick={handleAddInstruction}
                                />

                            </div>

                            {/* Display the list of added instructions */}
                            {orderFields?.deliveryInstructions?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {orderFields?.deliveryInstructions?.map((instruction, index) => (
                                        <div key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                                            <span className="text-sm">{instruction}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveInstruction(index)}
                                                className="text-red hover:text-red-dark text-sm"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div className="px-1 py-4">
                        <Cart
                            mealsList={orderFields?.mealsList}
                            vendor={selectedCustomer?.vendorId}
                            setOrderUpdateFields={setOrderFields}
                            totalOrderUnits={orderFields?.totalOrderUnits}
                        />
                    </div>
                </div>

                {/* Sticky footer with action buttons */}
                <div className="sticky bottom-0 bg-white">
                    <div className="flex justify-center gap-4 py-2">
                        <ButtonWithIcon
                            onClick={handleDiscardClicking}
                            text="Discard"
                            variant='discard'
                        />
                        <ButtonWithIcon
                            type="submit"
                            text="Checkout"
                            variant='confirm'
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PlaceOrders;