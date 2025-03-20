import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomInput from '../../../elements/customInput/CustomInput.jsx';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon.jsx';
// import dollarIcon from '../../../assets/dollar.svg';
import Cart from '../cart/Cart.jsx'
import ordersMiddleware from '../../../redux/middleware/ordersMiddleware.js';
import customersMiddleware from '../../../redux/middleware/customersMiddleware.js';
import { useDispatch } from 'react-redux';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import CustomDropdown from '../../../elements/customDropdown/CustomDropdown.jsx';
import { showErrorAlert } from '../../../redux/actions/alertActions.js';

const OrdersDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const location = useLocation();

    const { OrderData: orderdata, isEditable } = location.state || {}; // Destructure isEditable
    const [customerData, setcustomerData] = useState([]);
    const [Order, setOrder] = useState(orderdata)
console.log("orderdat", orderdata)
    const [cartItems, setCartItems] = useState([]);
    const [newInstruction, setNewInstruction] = useState(""); // state for the input field
    const [TotalUnits, setTotalUnits] = useState(0)

    const [OrderDetails, setOrderDetails] = useState({
        // Basic details
        participantId: '',
        participantName: '',
        CustomerPhone: '',
        CustomerAddress: "",
        DeliveryAddress: {
            street1: '',
            street2: '',
            city: '',
            state: '',
            zipcode: '',
            country: '',
        },
        Phone: "",
        Status: '',
        // Delivery details
        DeliveryNote: '',
        Allergies: '',

        // Alternate contact details
        AlternateContactName: '',
        AlternateContactPhone: '',
        AlternateContactAddress: "",

        // Order Details
        OrderID: '',
        OrderPlaceDateTime: '',
        OrderCompleteDateTime: '',
        mealIDsList: [],
        OrderUnits: '',
        DeliveryInstructions: [],
        OrderStatus: '',
    });

    const mode = isEditable ? 'edit' : 'read';

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await dispatch(customersMiddleware.GetCustomer(Order?.participantId));
                if (response.success) {
                    setcustomerData(response.data);
                } else {
                    console.error("Error fetching customer data:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
        };
        if (orderdata) {
            fetchCustomer();
        }

    }, [dispatch]);


    useEffect(() => {
        if (Order && customerData) {
            console.log("Customer", customerData)
            setOrderDetails({
                participantId: customerData._id || '',
                participantName: customerData.Name || '',
                CustomerPhone: customerData.Phone || '',
                Phone: Order.Phone || '',
                CustomerAddress: [
                    customerData.street1 || "",
                    customerData.street2 || "",
                    customerData.city || "",
                    customerData.state || "",
                    customerData.zipcode || "",
                ]
                    .filter(value => value)
                    .join(" -- ")
                    .trim(),
                DeliveryAddress: {
                    street1: Order.DeliveryAddress?.street1 || "",
                    street2: Order.DeliveryAddress?.street2 || "",
                    city: Order.DeliveryAddress?.city || "",
                    state: Order.DeliveryAddress?.state || "",
                    zipcode: Order.DeliveryAddress?.zipcode || "",
                    country: Order.DeliveryAddress?.country || "",
                },
                DeliveryNote: customerData.DeliveryNote || '',
                Allergies: customerData.Allergies || '',
                AlternateContactName: customerData.alternateContactName || '',
                AlternateContactPhone: customerData.alternateContactPhone || '',
                AlternateContactAddress: [
                    customerData.alternateContactStreet1 || "",
                    customerData.alternateContactStreet2 || "",
                    customerData.alternateContactCity || "",
                    customerData.alternateContactState || "",
                    customerData.alternateContactZipcode || "",
                ]
                    .filter(value => value)
                    .join(" -- ")
                ,
                OrderID: Order?._id?.toString() || '',
                Status: Order.Status || '',
                OrderPlaceDateTime: Order.OrderPlaceDateTime ? formatDate(orderdata.OrderPlaceDateTime) : '',
                OrderCompleteDateTime: Order.OrderCompleteDateTime ? formatDate(orderdata.OrderCompleteDateTime) : '',
                mealIDsList: Order.mealIDsList || [],
                OrderUnits: Order.OrderUnits || '',
                DeliveryInstructions: Order.DeliveryInstructions || [],
                OrderStatus: Order.Status || '',
            });
        }
    }, [orderdata, customerData, Order]);

    // Handle input change
    const handleInstructionChange = (event) => {
        setNewInstruction(event.target.value); // Update the input field value
    };

    // Add new instruction
    const handleAddInstruction = () => {
        if (newInstruction.trim()) {
            setOrderDetails((prevDetails) => ({
                ...prevDetails,
                DeliveryInstructions: [...prevDetails.DeliveryInstructions, newInstruction],
            }));
            setNewInstruction(""); // Reset input field after adding instruction
        }
    };

    // Remove an instruction
    const handleRemoveInstruction = (index) => {
        setOrderDetails((prevDetails) => ({
            ...prevDetails,
            DeliveryInstructions: prevDetails.DeliveryInstructions.filter((_, i) => i !== index),
        }));
    };

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
        setOrderDetails((prevData) => ({
            ...prevData,
            [name]: formattedValue,  // Dynamically update the field specified by the name
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("DeliveryAddress.")) {
            const deliveryField = name.split(".")[1];
            setOrderDetails((prevDetails) => ({
                ...prevDetails,
                DeliveryAddress: {
                    ...prevDetails.DeliveryAddress,
                    [deliveryField]: value,
                },
            }));
        } else {
            setOrderDetails((prevDetails) => ({
                ...prevDetails,
                [name]: value,
            }));
        }
    };


    const formatDate = (isoDateString) => {
        if (!isoDateString) return '';
        const date = new Date(isoDateString);
        // Ensure that the date is valid before formatting
        if (isNaN(date)) return '';
        return date.toISOString().split('T')[0]; // Extract yyyy-MM-dd
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (TotalUnits === 0) {
            dispatch(showErrorAlert("Please add meals to cart."))
            return;
        }

        OrderDetails.OrderUnits = TotalUnits
        try {
            const response = await dispatch(ordersMiddleware.UpdateOrder(orderdata._id, OrderDetails));

            if (response.success) {
                navigate('/orders');
            } else {
                console.error("Error updating order", response);
            }
        } catch (error) {
            console.error("Error occurred while updating order:", error);
        }
    };

    const handleCancel = (e) => {
        e.preventDefault();
        navigate(-1);
    };

    return (
        <div className=" bg-white p-5 rounded-2xl overflow-y-auto h-[calc(100vh-100px)]">
            <div className="flex flex-col gap-4 font-['Poppins',sans-serif]">
                <div className='flex justify-between'>
                    <h1 className="text-gray-800 font-bold text-2xl ">Order Details</h1>
                    <CrossButton onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700" />
                </div>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4 '>
                    <div className="flex flex-wrap gap-[10px] w-full ">
                        <div className="flex-1 min-w-[1px]">
                            <label htmlFor="OrderID" className="block font-bold ">Order ID</label>
                            <CustomInput
                                id="OrderID"
                                name="OrderID"
                                value={OrderDetails.OrderID}
                                readOnly={true}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="flex-1 min-w-[1px]">
                            <label htmlFor="participantName" className="block font-bold ">Participant Name</label>
                            <CustomInput
                                id="participantName"
                                name="participantName"
                                value={OrderDetails.participantName}
                                readOnly={true}
                                required
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-[10px] w-full ">
                        <div className="flex-1 min-w-[1px]">
                            <label htmlFor="CustomerPhone" className="block font-bold">Participant Contact 1</label>
                            <CustomInput
                                id="CustomerPhone"
                                name="CustomerPhone"
                                value={OrderDetails.CustomerPhone}
                                readOnly={true}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="flex-1 min-w-[1px]">
                            <label htmlFor="OrderPhone" className="block font-bold">Participant Contact 2</label>
                            <CustomInput
                                id="Phone"
                                name="Phone"
                                type='tel'
                                value={OrderDetails.Phone}
                                onChange={mode === 'edit' ? handlePhoneChange : undefined}
                                className="w-full"
                                readOnly={mode === 'read'}
                                required
                            />
                        </div>
                        <div className="flex-1 min-w-[1px]">
                            <label htmlFor="Status" className="block font-bold ">
                                Status
                            </label>
                            <CustomDropdown
                                id="Status"
                                name="Status"
                                value={OrderDetails.Status}
                                onChange={mode === 'edit' ? handleInputChange : undefined}
                                disabled={mode === 'read'}
                                placeholder="Select Status"
                                options={[
                                    { value: "Active", label: "Active" },
                                    { value: "Pending", label: "Pending" },
                                    { value: "Completed", label: "Completed" },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-[1px]">
                        <label htmlFor="CustomerAddress" className="block font-bold">Participant Address</label>
                        <textarea
                            id="CustomerAddress"
                            name="CustomerAddress"
                            value={OrderDetails.CustomerAddress}
                            readOnly={true}
                            required
                            className="w-full h-fit resize-none bg-gray-300 rounded-lg border-gray-100 p-1"
                        />
                    </div>

                    <label htmlFor="DeliveryAddress" className="block font-bold">Delivery Address</label>
                    <div className="flex-1 min-w-[1px]">
                        <label htmlFor="street1" className="block font-bold">
                            Street Line1*
                        </label>
                        <CustomInput
                            id="street1"
                            name="DeliveryAddress.street1"
                            value={OrderDetails.DeliveryAddress.street1}
                            onChange={mode === 'edit' ? handleInputChange : undefined}
                            className="w-full"
                            readOnly={mode === 'read'}
                            required
                        />
                    </div>
                    <div className="flex-1 min-w-[1px]">
                        <label htmlFor="street2" className="block font-bold">
                            Street Line2*
                        </label>
                        <CustomInput
                            id="street2"
                            name="DeliveryAddress.street2"
                            value={OrderDetails.DeliveryAddress.street2}
                            onChange={mode === 'edit' ? handleInputChange : undefined}
                            className="w-full"
                            readOnly={mode === 'read'}
                            required
                        />
                    </div>

                    <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
                        <div className="flex-1 min-w-[1px]">
                            <label htmlFor="city" className="block font-bold">
                                City *
                            </label>
                            <CustomInput
                                id="city"
                                name="DeliveryAddress.city"
                                value={OrderDetails.DeliveryAddress.city}
                                onChange={mode === 'edit' ? handleInputChange : undefined}
                                className="w-full"
                                readOnly={mode === 'read'}
                                required
                            />
                        </div>

                        <div className="flex-1 min-w-[1px]">
                            <label htmlFor="state" className="block font-bold">
                                State *
                            </label>
                            <CustomInput
                                id="state"
                                name="DeliveryAddress.state"
                                value={OrderDetails.DeliveryAddress.state}
                                onChange={mode === 'edit' ? handleInputChange : undefined}
                                className="w-full"
                                readOnly={mode === 'read'}
                                required
                            />
                        </div>

                        <div className="flex-1 min-w-[1px]">
                            <label htmlFor="zipcode" className="block font-bold">
                                Zipcode *
                            </label>
                            <CustomInput
                                id="zipcode"
                                name="DeliveryAddress.zipcode"
                                value={OrderDetails.DeliveryAddress.zipcode}
                                onChange={mode === 'edit' ? handleInputChange : undefined}
                                className="w-full"
                                readOnly={mode === 'read'}
                                required
                            />
                        </div>

                        {/* <div className="flex-1 min-w-[1px]">
                            <label htmlFor="country" className="block font-bold">
                                Country *
                            </label>
                            <CustomInput
                                id="country"
                                name="DeliveryAddress.country"
                                value={OrderDetails.DeliveryAddress.country}
                                onChange={mode === 'edit' ? handleInputChange : undefined}
                                className="w-full"
                                readOnly={mode === 'read'}
                                required
                            />
                        </div> */}
                    </div>

                    <div className="flex flex-col gap-2 w-full mb-2">
                        {/* Label */}
                        <label htmlFor="DeliveryInstructions" className="block font-bold">
                            Delivery Instructions
                        </label>

                        {/* Input Field and Button */}
                        <div className="flex items-center gap-4">
                            <CustomInput
                                id="DeliveryInstructions"
                                name="DeliveryInstructions"
                                placeholder="Low Spice level..."
                                value={newInstruction}
                                onChange={mode === 'edit' ? handleInstructionChange : undefined}
                                className="w-full"
                                readOnly={mode === 'read'}
                            />
                            <button
                                type="button"
                                onClick={handleAddInstruction}
                                className="bg-custom-blue text-white px-4 py-2 rounded-md text-sm hover:bg-custom-blue-dark flex items-center justify-center"
                            >
                                Add Instruction
                            </button>
                        </div>

                        {/* Tags for Added Instructions */}
                        {OrderDetails.DeliveryInstructions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {OrderDetails.DeliveryInstructions.map((instruction, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full w-fit"
                                    >
                                        <span className="text-sm text-black">{instruction}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveInstruction(index)}
                                            className="text-customer-red hover:text-red-700 text-sm"
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[15px] mb-[15px] w-full">
                        <div className="flex-1 min-w-[1px]">
                            <label htmlFor="Allergies" className="block font-bold">Allergies</label>
                            <CustomInput
                                id="Allergies"
                                name="Allergies"
                                value={OrderDetails.Allergies}
                                readOnly={true}
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col min-w-[1px]">
                            <label htmlFor="OrderPlaceDateTime" className="block font-bold">Order Placement Date</label>
                            <span className="flex items-center px-5 py-1 rounded-full bg-custom-blue text-white">
                                {OrderDetails.OrderPlaceDateTime}
                            </span>
                        </div>

                        <div className="flex flex-col min-w-[1px]">
                            <label htmlFor="OrderCompleteDateTime" className="block font-bold">Order Delivery Date</label>
                            <span className="flex items-center px-5 py-1 rounded-full bg-custom-blue text-white">
                                {OrderDetails.OrderCompleteDateTime || "N/A"}
                            </span>
                        </div>

                        <div className="flex flex-col min-w-[1px]">
                            <label htmlFor="OrderStatus" className="block font-bold">Order Status</label>
                            <span className="flex items-center px-5 py-1 rounded-full bg-custom-blue text-white">
                                {OrderDetails.OrderStatus}
                            </span>
                        </div>
                    </div>


                    {/* Alternate Contact Info */}
                    <div className=" bg-white ">
                        <div className="font-['Poppins',sans-serif]">
                            <h1 className="text-gray-800 font-bold text-2xl mb-[10px]">Alternate Contact Info</h1>
                            <div className="flex flex-col gap-[10px] mb-[15px] w-full">
                                {/* Name and Contact Number in the same line */}
                                <div className="flex gap-[10px] w-full">
                                    <div className="flex-1 min-w-[1px]">
                                        <label htmlFor="AlternateContactName" className="block font-bold">Name:</label>
                                        <CustomInput
                                            id="AlternateContactName"
                                            name="AlternateContactName"
                                            value={OrderDetails.AlternateContactName}
                                            readOnly={true}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[1px]">
                                        <label htmlFor="AlternateContactPhone" className="block font-bold">Contact Number:</label>
                                        <CustomInput
                                            id="AlternateContactPhone"
                                            name="AlternateContactPhone"
                                            value={OrderDetails.AlternateContactPhone}
                                            className="w-full"
                                            readOnly={true}
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-[1px]">
                                    <label htmlFor="AlternateContactAddress" className="block font-bold">Address</label>
                                    <textarea
                                        id="AlternateContactAddress"
                                        name="AlternateContactAddress"
                                        value={OrderDetails.AlternateContactAddress}
                                        readOnly={true}
                                        required
                                        className="w-full h-fit resize-none bg-gray-300 rounded-lg border-gray-100 p-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-2 ">
                        {mode === 'read' ? (
                            <div className="w-full mt-4">
                                <h2 className="text-lg font-semibold">Dishes Ordered</h2>
                                <table className="w-full border-collapse ">
                                    <thead>
                                        <tr>
                                            <th className="text-left text-gray-500 font-medium py-3 px-5">Dish Name</th>
                                            <th className="text-left text-gray-500 font-medium py-3 px-5">Count</th>
                                            <th className="text-left text-gray-500 font-medium py-3 px-5">Vender ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {OrderDetails.mealIDsList.map((dish) => (
                                            <tr key={dish.mealId} className="border-t border-gray-200 border-b">
                                                <td className="py-3 px-5">{dish.mealName}</td>
                                                <td className="py-3 px-5">{dish.Count}</td>
                                                <td className="py-3 px-5">{dish.vendorId}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex-grow">
                                <Cart setOrder={setOrderDetails} Order={OrderDetails} cartItems={cartItems} setCartItems={setCartItems} TotalUnits={TotalUnits} setTotalUnits={setTotalUnits} />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-2">
                        {mode === 'read' ? (
                            <ButtonWithIcon
                                type="button"
                                onClick={handleCancel}
                                text="Close"
                                className="bg-custom-blue text-white px-3 py-2 rounded-full"
                            />
                        ) : (
                            <>
                                <ButtonWithIcon
                                    type="button"
                                    onClick={handleCancel}
                                    text="Discard"
                                    className="bg-customer-red border text-white px-10 py-1 rounded-full text-lg flex items-center justify-center"
                                />
                                <ButtonWithIcon
                                    type="submit"
                                    text="Save"
                                    className="bg-custom-blue border text-white px-10 py-1 rounded-full text-lg flex items-center justify-center"
                                />
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrdersDetails;