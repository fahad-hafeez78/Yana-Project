import Checkbox from "../../../elements/checkBox/CheckBox";
import CrossButton from "../../../elements/crossButton/CrossButton";
import MultiTextField from "../../../elements/multiTextField/MultiTextField";
import CustomInput from "../../../elements/customInput/CustomInput";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import ImageModal from "../../../elements/imageModal/ImageModal.jsx";

const checkboxOptions = [
    { label: "Low-sodium" },
    { label: "Lactose Intolerant" },
    { label: "Diabetic Friendly" },
    { label: "Vegetarian" },
    { label: "Gluten Free" },
];

const multiTextFields = [
    { label: "Meal Description", name: "description", placeholder: "Enter meal description..." },
    { label: "Ingredients", name: "ingredients", placeholder: "Enter ingredients separated by commas (e.g., chicken, rice, vegetables)" },
    { label: "Nutrition Info", name: "nutrition_info", placeholder: "Enter nutrition info separated by commas (e.g., 300 calories, 20g protein, 10g fat)" },
    { label: "Allergies", name: "allergies", placeholder: "Enter allergies separated by commas (e.g., nuts, dairy, gluten)" }
];


export default function MealFormFields({
    formFields,
    setFormFields,

    imageUrl,

    vendors,

    handleInputChange,
    handleImageUpload,
    handleRemoveImage,

    isVendorPermission,

    handleDiscardClicking,
    handleSubmit
}) {

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    };
    return (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col flex-grow min-h-0">
            {/* Scrollable content area */}
            <div className="flex-grow overflow-y-auto px-2">
                {/* Meal Information Section */}
                <div className="space-y-4">
                    {/* Title and Image Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomInput
                            label="Title"
                            type="text"
                            name="name"
                            placeholder="Add meal name..."
                            value={formFields?.name}
                            onChange={handleInputChange}
                            required
                            validationKey="alphanumeric"
                        />
                        <div>
                            <label className="block font-semibold">
                                Add meal image <span className="text-red-600">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative inline-block border border-gray-light rounded-md p-1">
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        required={formFields.image === null || formFields.image.length === 0}
                                        accept="image/*"
                                        key={formFields.image ? 'has-image' : 'no-image'}
                                        className="absolute inset-0 opacity-0 py-1 w-full"
                                    />
                                    <span className="text-gray-dark">Choose File</span>
                                </div>
                                {formFields?.image?.length > 0 ? (
                                    <div className="flex items-center gap-1">
                                        <ImageModal
                                            imageUrl={imageUrl || formFields?.image}
                                            className="w-8 h-8 rounded-lg object-cover"
                                        />
                                        <CrossButton
                                            className="w-8 h-8"
                                            onClick={handleRemoveImage}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray">No file selected</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Category and Vendor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomDropdown
                            label="Meal Category"
                            name="category"
                            value={formFields.category}
                            onChange={handleInputChange}
                            options={[
                                { value: "", label: "Select" },
                                { value: "breakfast", label: "Breakfast" },
                                { value: "lunch", label: "Lunch" },
                                { value: "dinner", label: "Dinner" },
                            ]}
                        />
                        <CustomDropdown
                            label="Vendor"
                            name="Vendor"
                            value={formFields.vendor?.id}
                            disabled={!isVendorPermission}
                            onChange={(e) => {
                                const selectedVendorId = e.target.value;
                                const selectedVendor = vendors.find((vendor) => vendor.value === selectedVendorId);
                                if (selectedVendor) {
                                    setFormFields((prev) => ({
                                        ...prev,
                                        vendor: { id: selectedVendor.value, name: selectedVendor.Name }
                                    }));
                                }
                            }}
                            options={vendors}
                        />
                    </div>

                    {/* Meal Labels */}
                    <div>
                        <label className="block font-semibold mb-2">Meal Labels</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {checkboxOptions.map((item) => (
                                <Checkbox
                                    key={item.label}
                                    value={item.label}
                                    label={item.label}
                                    checked={formFields.tags.includes(item.label)}
                                    onChange={handleInputChange}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div>
                        <MultiTextField
                            fields={multiTextFields}
                            handleInputChange={handleInputChange}
                            MultiTextFields={formFields}
                            maxlength='255'
                        />
                    </div>
                </div>
            </div>

            {/* Sticky footer with action buttons */}
            <div className="sticky bottom-0 bg-white">
                <div className="flex justify-center gap-4 py-2">
                    <ButtonWithIcon
                        type="button"
                        onClick={handleDiscardClicking}
                        text="Discard"
                        variant="discard"
                    />
                    <ButtonWithIcon
                        type="submit"
                        text="Confirm"
                        variant="confirm"
                    />
                </div>
            </div>
        </form>
    )
}