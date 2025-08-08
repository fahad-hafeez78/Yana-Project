import { useEffect, useState } from "react";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import CustomInput from "../../../elements/customInput/CustomInput";
import mealsMiddleware from "../../../redux/middleware/mealsMiddleware";
import vendorsMiddleware from "../../../redux/middleware/vendorsMiddleware";
import { useDispatch } from "react-redux";
import OrderCard from "../orderscard/Orderscard";
import MealsDeleteModal from "../../meals/mealsDeleteModal/MealsDeleteModal";
import trash from "../../../assets/customIcons/generalIcons/trash-white.svg";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import usePermissionChecker from "../../../util/permissionChecker/PermissionChecker";


export default function Cart({ mealsList, setOrderUpdateFields, totalOrderUnits, vendor }) {

    const dispatch = useDispatch();

    const [mealInput, setMealInput] = useState('');
    const [availableMeals, setavailableMeals] = useState([]);
    const [filteredMeals, setFilteredMeals] = useState([]);


    const checkPermission = usePermissionChecker()
    const isViewMealPermission = checkPermission('meal', 'view');

    useEffect(() => {
        const fetchMealsByVendorId = async () => {
            try {
                const response = await dispatch(mealsMiddleware.GetActiveAssignedMealsByVendorId(vendor?._id));
                setavailableMeals(response?.meals);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        if (vendor?._id && isViewMealPermission) fetchMealsByVendorId();
    }, [vendor]);


    const handleInputChange = (e) => {

        const { name, value } = e.target;
        setOrderUpdateFields((prev) => ({ ...prev, [name]: value }));

        if (name === 'meals') {
            setMealInput(value);
            if (vendor?._id && value.trim()) {
                setFilteredMeals(
                    availableMeals.filter(
                        (meal) =>
                            meal.name.toLowerCase().includes(value.toLowerCase()) &&
                            meal.vendorId === vendor?._id
                    )
                );
            } else {
                setFilteredMeals([]);
            }
        }
    };

    const handleIncrementCount = (mealName, e) => {
        e.preventDefault();
        setOrderUpdateFields((prevOrder) => {
            const updatedMealsList = prevOrder?.mealsList.map((item) => {
                if (item?.meal?.name === mealName) {
                    return {
                        ...item,
                        quantity: item?.quantity + 1,
                    };
                }
                return item;
            });

            const updatedOrderUnits = updatedMealsList.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

            return { ...prevOrder, mealsList: updatedMealsList, totalOrderUnits: updatedOrderUnits };
        });
    };


    const handleDecrementCount = (mealName, e) => {
        e.preventDefault();
        setOrderUpdateFields((prevOrder) => {
            const updatedMealsList = prevOrder?.mealsList
                .map((item) => {
                    if (item?.meal?.name === mealName) {
                        return {
                            ...item,
                            quantity: Math.max(item?.quantity - 1, 0), // Prevent negative quantities
                        };
                    }
                    return item;
                })
                .filter((item) => item.quantity > 0);

            const updatedOrderUnits = updatedMealsList.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

            return { ...prevOrder, mealsList: updatedMealsList, totalOrderUnits: updatedOrderUnits };
        });
    };


    const handleRemoveFromCart = (item, e) => {
        e.preventDefault();
        const mealId = item?.meal?._id;
        setOrderUpdateFields((prevOrder) => {
            const updatedMealsList = prevOrder?.mealsList.filter(
                (item) => item?.meal?._id !== mealId
            );
            // Calculate the new total units after removal
            const updatedOrderUnits = updatedMealsList.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
            return {
                ...prevOrder,
                mealsList: updatedMealsList,
                totalOrderUnits: updatedOrderUnits
            };
        });
    };
    const handleAddToCart = (selectedMeal) => {

        if (selectedMeal && selectedMeal.vendorId === vendor?._id) {
            setOrderUpdateFields((prevOrder) => {
                const updatedMeals = prevOrder.mealsList || [];
                const mealIndex = updatedMeals.findIndex(
                    (item) => item.meal._id === selectedMeal._id
                );
                if (mealIndex >= 0) {
                    updatedMeals[mealIndex].quantity += 1;
                } else {
                    updatedMeals.push({
                        meal: { _id: selectedMeal._id, name: selectedMeal.name, image: selectedMeal?.image },
                        vendorId: { _id: selectedMeal.vendorId },
                        quantity: 1,
                    });
                }
                const updatedOrderUnits = updatedMeals.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );
                return {
                    ...prevOrder,
                    mealsList: updatedMeals,
                    totalOrderUnits: updatedOrderUnits,
                };
            });

            setMealInput('');
            setFilteredMeals([]);
        }
    };

    const clearCart = () => {
        setOrderUpdateFields(prevOrder => ({
            ...prevOrder,
            mealsList: [],
            totalOrderUnits: 0
        }));
        setMealInput('');
        setFilteredMeals([]);
    };

    return (
        <div>
            <h1 className='py-1 font-semibold text-2xl'>Cart <span className='text-red-600'>*</span></h1>
            <div className="relative w-full">
                <div className='flex gap-5 '>
                    <div className='relative w-full'>
                        <div className="flex py-3">
                            <h1 className="w-40 py-1 font-semibold flex-shrink-0">Search Meal Item <span className='text-red-600'>*</span></h1>
                            <div className="flex-grow">
                                <CustomInput
                                    id="meals"
                                    name="meals"
                                    placeholder="Pasta..."
                                    value={mealInput}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                                {filteredMeals.length > 0 && (
                                    <ul className="absolute z-10 bg-white border border-gray-light rounded-md shadow-lg max-h-[200px] overflow-y-auto min-w-[100%]">
                                        {filteredMeals.map((meal, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleAddToCart(meal)}
                                                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            >
                                                <img
                                                    src={meal.image}
                                                    alt={meal.name}
                                                    className="h-8 w-8 rounded-full mr-2"
                                                />
                                                <span className='px-3 font-thin '>{meal.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full py-3 items-center">
                        <h2 className='w-40 items-center font-semibold'>Vendor <span className='text-red-600'>*</span></h2>
                        <CustomDropdown
                            id="Vendor"
                            name="Vendor"
                            value={vendor?._id || ""}
                            disabled
                            placeholder="Select Vendor"
                            className="rounded-md py-1.5"
                            options={[
                                { value: vendor?._id, label: vendor?.name },
                            ]}
                        />
                    </div>
                </div>
                <div className='flex w-full gap-2 py-3 justify-center'>
                    <div className='flex'>
                        <ButtonWithIcon
                            onClick={(e) => {
                                e.preventDefault();
                                clearCart();
                            }}
                            icon={<img src={trash} alt="cart" width={20} height={20} />}
                            text="Clear cart"
                            variant="discard"
                        />
                    </div>
                </div>
            </div>


            <div className="flex w-full py-3 ">
                <h2 className="w-40 text-lg font-semibold mb-2 flex-shrink-0">Cart Items</h2>
                <div className="bg-blue-50 w-full h-64 p-4 overflow-y-auto">
                    {mealsList?.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {mealsList?.map((item, index) => (
                                <div key={index} className="py-1">
                                    <OrderCard
                                        name={item?.meal?.name}
                                        count={item?.quantity}
                                        imgPath={item?.meal?.image}
                                        onIncrement={(e) => handleIncrementCount(item.meal.name, e)}
                                        onDecrement={(e) => handleDecrementCount(item.meal.name, e)}
                                        onRemove={(e) => handleRemoveFromCart(item, e)}
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
                <span>Total Items: {totalOrderUnits || 0}</span>

            </div>
        </div>
    )
}