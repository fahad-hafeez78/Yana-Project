import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CrossButton from "../../../elements/crossButton/CrossButton";
import CustomInput from "../../../elements/customInput/CustomInput";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import Cart from "../cart/Cart";
import moment from "moment";
import { useState } from "react";
import ordersMiddleware from "../../../redux/middleware/ordersMiddleware";
import { useDispatch } from "react-redux";
import { showErrorAlert } from "../../../redux/actions/alertActions";
import Spinner from "../../../elements/customSpinner/Spinner";
import usePhoneFormatter from "../../../util/phoneFormatter/phoneFormatter";
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";


export default function OrdersDetails() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchParams] = useSearchParams();

    const { OrderData: orderdata, isEditable } = location.state || {};
    const mode = isEditable ? 'edit' : 'read';
    const [newInstruction, setNewInstruction] = useState("");

    const [orderUpdateFields, setOrderUpdateFields] = useState({
        phone: orderdata?.phone,
        status: orderdata?.status,
        deliveryAddress: {
            street1: orderdata?.delivery_location?.street1,
            street2: orderdata?.delivery_location?.street2,
            city: orderdata?.delivery_location?.city,
            state: orderdata?.delivery_location?.state,
            zip: orderdata?.delivery_location?.zip,
        },
        deliveryInstructions: orderdata?.instructions,
        mealsList: orderdata?.meals,
        totalOrderUnits: orderdata?.order_units
    })

    const [isLoading, setIsLoading] = useState(false);


    const formatParticipantAddress = (participantAddress) => {
        if (!participantAddress) return "N/A";

        const addressParts = [
            participantAddress.street1 || "",
            participantAddress.street2 || "",
            participantAddress.city || "",
            participantAddress.state || "",
            participantAddress.zip || "",
        ];
        return addressParts.filter(value => value).join(" -- ");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("deliveryAddress.")) {
            const deliveryField = name.split(".")[1];
            setOrderUpdateFields((prevDetails) => ({
                ...prevDetails,
                deliveryAddress: {
                    ...prevDetails.deliveryAddress,
                    [deliveryField]: value,
                },
            }));
        } else {
            setOrderUpdateFields((prevDetails) => ({
                ...prevDetails,
                [name]: value,
            }));
        }
    };

    const handleInstructionChange = (event) => {
        setNewInstruction(event.target.value);
    };

    // Add new instruction
    const handleAddInstruction = () => {
        if (newInstruction.trim()) {
            setOrderUpdateFields((prevDetails) => ({
                ...prevDetails,
                deliveryInstructions: [...prevDetails.deliveryInstructions, newInstruction],
            }));
            setNewInstruction("");
        }
    };

    const handleRemoveInstruction = (index) => {
        setOrderUpdateFields((prevDetails) => ({
            ...prevDetails,
            deliveryInstructions: prevDetails.deliveryInstructions.filter((_, i) => i !== index),
        }));
    };

    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = usePhoneFormatter(value);

        setOrderUpdateFields((prevData) => ({
            ...prevData,
            [name]: formattedValue,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (orderUpdateFields?.phone?.length < 14) {
            dispatch(showErrorAlert("Enter Valid Phone number"));
            return;
        }
        const updatedMealBody = {
            meals: orderUpdateFields?.mealsList?.map(item => ({
                meal: item?.meal?._id,
                vendorId: item?.vendorId?._id,
                quantity: item?.quantity,
            })),
        };
        const updatedOrderBody = {
            "customer": orderdata?.customer?._id,
            "phone": orderUpdateFields?.phone,
            "meals": updatedMealBody?.meals,
            "instructions": orderUpdateFields?.deliveryInstructions,
            "delivery_location": orderUpdateFields?.deliveryAddress,
            "status": orderUpdateFields?.status,
            "order_units": orderUpdateFields?.totalOrderUnits,
        }
        if (orderUpdateFields?.totalOrderUnits === 0) {
            dispatch(showErrorAlert("Please add meals to cart."))
            return;
        }

        try {
            setIsLoading(true);
            const response = await dispatch(ordersMiddleware.UpdateOrder(orderdata?._id, updatedOrderBody));

            if (response.success) {
                navigate(`/orders?${searchParams.toString()}`);
            }
        } catch (error) {
            console.error("Error occurred while updating order:", error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleCancel = (e) => {
        e.preventDefault();
        navigate(-1)
    };

    const getDeliveryDate = (e) => {
        let firstOrderCreatedAt = moment(orderdata?.createdAt);
        let nextThursday = firstOrderCreatedAt.day(11).format("MM-DD-YYYY");
        return nextThursday;
    };

    if (isLoading) {
        return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
    }

    return (
        <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-gray-800 font-bold text-2xl">Order Details</h1>
                <CrossButton onClick={handleCancel} className="text-gray hover:text-gray-dark" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                {/* Scrollable content area */}
                <div className="flex-grow overflow-y-auto">
                    {/* Order Information Section */}
                    <div className="space-y-4">
                        {/* Order ID and Participant Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomInput
                                label="Order ID"
                                name="OrderID"
                                value={orderdata?.order_id}
                                readOnly={true}
                            />
                            <CustomInput
                                label="Participant Name"
                                name="CustomerName"
                                value={orderdata?.customer?.name}
                                readOnly={true}
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <CustomInput
                                label="Participant Contact 1"
                                name="CustomerPhone"
                                value={orderdata?.customer?.phone}
                                readOnly={true}
                            />
                            <CustomInput
                                label="Participant Contact 2"
                                name="phone"
                                type="tel"
                                value={orderUpdateFields?.phone}
                                onChange={mode === 'edit' ? handlePhoneChange : undefined}
                                readOnly={mode === 'read'}
                                required
                            />

                            <CustomDropdown
                                label="Status"
                                name="status"
                                value={orderUpdateFields?.status}
                                onChange={mode === 'edit' ? handleInputChange : undefined}
                                disabled={mode === 'read'}
                                options={[
                                    { value: "", label: "Select" },
                                    { value: "active", label: "Active" },
                                    { value: "pending", label: "Pending" },
                                    { value: "on the way", label: "On the Way" },
                                    { value: "completed", label: "Completed" },
                                    { value: "canceled", label: "Canceled" },
                                ]}
                            />
                        </div>

                        {/* Address Information */}
                        <div>
                            <label htmlFor="CustomerAddress" className="block font-bold">
                                Participant Address
                            </label>
                            <textarea
                                id="CustomerAddress"
                                name="CustomerAddress"
                                value={formatParticipantAddress(orderdata?.customer?.address)}
                                readOnly={true}
                                className="w-full h-fit resize-none bg-gray-light rounded-lg p-2 border border-gray-light"
                            />
                        </div>

                        {/* Delivery Address Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-dark">Delivery Address</h2>

                            {/* Street Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    label="Street Line 1"
                                    name="deliveryAddress.street1"
                                    value={orderUpdateFields?.deliveryAddress?.street1}
                                    onChange={mode === 'edit' ? handleInputChange : undefined}
                                    validationKey="street"
                                    readOnly={mode === 'read'}
                                    required
                                />
                                <CustomInput
                                    label="Street Line 2"
                                    name="deliveryAddress.street2"
                                    value={orderUpdateFields?.deliveryAddress?.street2}
                                    onChange={mode === 'edit' ? handleInputChange : undefined}
                                    validationKey="street"
                                    readOnly={mode === 'read'}
                                />
                            </div>

                            {/* City, State, Zip */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <CustomInput
                                    label="City"
                                    name="deliveryAddress.city"
                                    value={orderUpdateFields?.deliveryAddress?.city}
                                    onChange={mode === 'edit' ? handleInputChange : undefined}
                                    validationKey="cityorstate"
                                    readOnly={mode === 'read'}
                                    required
                                />
                                <CustomInput
                                    label="State"
                                    name="deliveryAddress.state"
                                    value={orderUpdateFields?.deliveryAddress?.state}
                                    onChange={mode === 'edit' ? handleInputChange : undefined}
                                    validationKey="cityorstate"
                                    readOnly={mode === 'read'}
                                    required
                                />
                                <CustomInput
                                    label="Zip code"
                                    name="deliveryAddress.zip"
                                    value={orderUpdateFields?.deliveryAddress?.zip}
                                    onChange={mode === 'edit' ? handleInputChange : undefined}
                                    minLength={3}
                                    maxLength={10}
                                    readOnly={mode === 'read'}
                                    required
                                />
                            </div>
                        </div>

                        {/* Delivery Instructions */}
                        <div className="space-y-2">
                            <label htmlFor="DeliveryInstructions" className="block font-bold">
                                Delivery Instructions
                            </label>
                            <div className="flex gap-4">
                                <div className="flex-grow">
                                    <CustomInput
                                        id="DeliveryInstructions"
                                        name="DeliveryInstructions"
                                        placeholder="Low Spice level..."
                                        value={newInstruction}
                                        onChange={mode === 'edit' ? handleInstructionChange : undefined}
                                        readOnly={mode === 'read'}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddInstruction}
                                    disabled={mode === 'edit' ? false : true}
                                    className="bg-blue text-white px-4 py-2 rounded-md text-sm hover:bg-blue-dark whitespace-nowrap"
                                >
                                    Add Instruction
                                </button>
                            </div>

                            {/* Instruction Tags */}
                            {orderUpdateFields?.deliveryInstructions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {orderUpdateFields.deliveryInstructions.map((instruction, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full"
                                        >
                                            <span className="text-sm">{instruction}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveInstruction(index)}
                                                className="text-xl text-red hover:text-red-dark "
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Order Dates and Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block font-bold">Order Placement Date</label>
                                <span className="inline-flex items-center px-4 py-1 rounded-full bg-blue text-white">
                                    {moment(orderdata?.createdAt).format("MM-DD-YYYY")}
                                </span>
                            </div>
                            <div>
                                <label className="block font-bold">Order Delivery Date</label>
                                <span className="inline-flex items-center px-4 py-1 rounded-full bg-blue text-white">
                                    {getDeliveryDate()}
                                </span>
                            </div>
                            <div>
                                <label className="block font-bold">Order Status</label>
                                <span className="inline-flex items-center px-4 py-1 rounded-full bg-blue text-white">
                                    {capitalizeFirstLetter(orderdata?.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Meals Section */}
                    <div className="mt-6">
                        {mode === 'read' ? (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Dishes Ordered</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left text-gray font-medium py-3 px-4">Dish Name</th>
                                                <th className="text-left text-gray font-medium py-3 px-4">Count</th>
                                                <th className="text-left text-gray font-medium py-3 px-4">Vendor ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderdata?.meals.map((meal) => (
                                                <tr key={meal?._id} className="border-b">
                                                    <td className="py-3 px-4">{meal?.meal?.name}</td>
                                                    <td className="py-3 px-4">{meal?.quantity}</td>
                                                    <td className="py-3 px-4">{meal?.vendorId?.vendor_id}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <Cart
                                mealsList={orderUpdateFields?.mealsList}
                                setOrderUpdateFields={setOrderUpdateFields}
                                totalOrderUnits={orderUpdateFields?.totalOrderUnits}
                                vendor={orderdata?.vendor}
                            />
                        )}
                    </div>
                </div>

                {/* Sticky footer with action buttons */}
                <div className="sticky bottom-0 bg-white">
                    <div className="flex justify-center gap-4 py-2">
                        {mode === 'read' ? (
                            <ButtonWithIcon
                                type="button"
                                onClick={handleCancel}
                                text="Close"
                                className="bg-blue text-white px-6 py-2 rounded-full"
                            />
                        ) : (
                            <>
                                <ButtonWithIcon
                                    type="button"
                                    onClick={handleCancel}
                                    text="Discard"
                                    className="bg-red-600 text-white px-6 py-2 rounded-full"
                                />
                                <ButtonWithIcon
                                    type="submit"
                                    text="Save"
                                    className="bg-blue text-white px-6 py-2 rounded-full"
                                />
                            </>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}