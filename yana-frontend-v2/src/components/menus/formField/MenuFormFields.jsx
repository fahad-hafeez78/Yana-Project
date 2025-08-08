import trash from "../../../assets/customIcons/generalIcons/trash-white.svg";
import AddMealIcon from '../../../assets/customIcons/generalIcons/AddCircle.svg';
import trashred from "../../../assets/customIcons/generalIcons/trash.svg";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import CrossButton from "../../../elements/crossButton/CrossButton";
import CustomInput from "../../../elements/customInput/CustomInput";
import { useNavigate } from "react-router-dom";
import usePermissionChecker from "../../../util/permissionChecker/PermissionChecker";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import ImageModal from "../../../elements/imageModal/ImageModal";

export default function MenuFormFields({
    menuData,
    handleInputChange,

    handleImageChange,
    selectedImage,
    imageUrl,
    handleRemoveImage,

    vendors = [],
    selectedVendorId,
    handleSelectVendor = {},
    isVendorDisbaled = false,

    mealInput,
    handleAddToMenu,
    handleClearMenu,
    handleRemoveFromMenu,

    filteredMeals,
    type = "create",

    handleCancel,
    handleSubmit

}) {


    const navigate = useNavigate();
    const checkPermissions = usePermissionChecker();
    const isEditMenuPermission = checkPermissions('menu', 'edit');
    const isCreateMealPermission = checkPermissions('meal', 'create');

    const shouldShowSubmitButton = () => {
        if (type === "create") return true;
        if (type === "edit" && isEditMenuPermission) return true;
        return false;
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
            {/* Scrollable content area */}
            <div className="flex-grow overflow-y-auto px-2 space-y-4">
                {/* Menu Name and Image Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                        label="Menu Name"
                        name="menuName"
                        value={menuData.menuName}
                        onChange={handleInputChange}
                        validationKey="alphanumeric"
                        required
                        readOnly={type === "create" ? false : !isEditMenuPermission}
                    />
                    <div>
                        <label className="block font-semibold">
                            Menu image <span className="text-red-600">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="relative inline-block border border-gray-light rounded-md p-1">
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    required={!selectedImage || selectedImage.length === 0}
                                    accept="image/*"
                                    disabled={type === "create" ? false : !isEditMenuPermission}
                                    key={selectedImage ? 'has-image' : 'no-image'}
                                    className="absolute inset-0 opacity-0 py-1 w-full"
                                />
                                <span className="text-gray-dark">Choose File</span>
                            </div>
                            {selectedImage?.length > 0 ? (
                                <div className="flex items-center gap-1">
                                    <ImageModal
                                        imageUrl={imageUrl || selectedImage}
                                        className="w-8 h-8 rounded-lg object-cover"
                                    />
                                    <CrossButton
                                        className="w-8 h-8"
                                        onClick={handleRemoveImage}
                                        disabled={type === "create" ? false : !isEditMenuPermission}
                                    />
                                </div>
                            ) : (
                                <span className="text-gray">No file selected</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vendor and Meal Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomDropdown
                        label="Vendor"
                        name="Vendor"
                        value={selectedVendorId || ""}
                        disabled={isVendorDisbaled}
                        onChange={handleSelectVendor}
                        options={vendors}
                    />
                    <div>
                        <div className="relative">
                            <CustomInput
                                label="Search Meal Item"
                                name="meals"
                                placeholder="Pasta..."
                                value={mealInput}
                                onChange={handleInputChange}
                                readOnly={type === "create" ? false : !isEditMenuPermission}
                            />
                            {filteredMeals.length > 0 && (
                                <ul className="absolute z-10 bg-white mt-1 w-full max-h-40 overflow-y-auto border border-gray-light rounded-md shadow-lg">
                                    {filteredMeals.map((meal, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleAddToMenu(meal)}
                                            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                                        >
                                            <img src={meal.image} alt={meal.name} className="h-8 w-8 rounded-full mr-2" />
                                            <span className='px-3 font-thin'>{meal.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 py-2">
                    <ButtonWithIcon
                        onClick={(e) => {
                            e.preventDefault();
                            handleClearMenu();
                        }}
                        disabled={type === "create" ? false : !isEditMenuPermission}
                        icon={<img src={trash} alt="cart" width={20} height={20} />}
                        text="Clear Menu"
                        variant="discard"
                    />
                    {isCreateMealPermission && <ButtonWithIcon
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/meals/add-meals');
                        }}
                        icon={<img src={AddMealIcon} alt="Add Meal" width={24} height={24} />}
                        text="Add New Meal"
                        variant="confirm"
                    />}

                </div>

                {/* Meals List */}
                <div>
                    <div className="flex justify-between">
                        <label className="block font-semibold mb-2">Meals</label>
                        <label className="px-4"><span className="font-semibold">Total:</span> {menuData.selectedMeals.length}</label>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        {menuData.selectedMeals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {menuData.selectedMeals.map((dish) => (
                                    <div key={dish._id} className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <ImageModal
                                                    imageUrl={dish?.image}
                                                    imageText={dish.name}
                                                    className="w-10 h-10 rounded-md flex-shrink-0"
                                                />
                                                <span className="font-semibold">{dish.name}</span>
                                            </div>

                                            <ButtonWithIcon
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleRemoveFromMenu(dish._id);
                                                }}
                                                disabled={type === "create" ? false : !isEditMenuPermission}
                                                icon={<img src={trashred} alt="cart" width={16} height={16} />}
                                                className="text-red-600 hover:text-red-800"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center py-8'>
                                <img src='/empty_menu.svg' width={200} height={200} alt="Empty menu" />
                                <p className="text-gray mt-2">No meals added yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky footer with action buttons */}
            <div className="sticky bottom-0 bg-white pt-4">
                <div className="flex justify-center gap-4 py-2">
                    <ButtonWithIcon
                        type="button"
                        onClick={handleCancel}
                        text="Discard"
                        variant="discard"
                    />
                    {shouldShowSubmitButton() && (
                        <ButtonWithIcon
                            type="submit"
                            text="Save"
                            variant="confirm"
                        />
                    )}
                </div>
            </div>
        </form>
    )
}