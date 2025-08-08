import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import CrossButton from "../../../elements/crossButton/CrossButton";
import CustomInput from "../../../elements/customInput/CustomInput";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import ImageModal from "../../../elements/imageModal/ImageModal";

export default function UserFormFields({
    adminData,
    handleInputChange,
    handleRoleChange = {},
    handlePhoneChange,
    handleImageUpload,
    handleRemoveImage,
    isVendor,
    isRoleDisabled = false,
    imageUrl,
    roles = [],
    isEditable = true,
    handleSubmit,
    handleCancel
}) {

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    };

    return (

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col flex-grow min-h-0">
            {/* Scrollable content area */}
            <div className="flex-grow overflow-y-auto px-2 space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                        label="Name"
                        name="name"
                        value={adminData.name}
                        onChange={handleInputChange}
                        readOnly={!isEditable}
                        required
                        validationKey="alphanumeric"
                    />
                    <CustomDropdown
                        label="Role"
                        name="roleId"
                        value={adminData.roleId || ""}
                        disabled={isRoleDisabled}
                        onChange={handleRoleChange}
                        required
                        options={roles}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                        label="Email"
                        name="email"
                        type="email"
                        value={adminData.email}
                        onChange={handleInputChange}
                        readOnly={!isEditable}
                        required
                    />
                    <CustomInput
                        label="Phone"
                        name="phone"
                        value={adminData.phone}
                        onChange={handlePhoneChange}
                        readOnly={!isEditable}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomDropdown
                        label="Gender"
                        name="gender"
                        value={adminData.gender || ""}
                        disabled={!isEditable}
                        onChange={handleInputChange}
                        options={[
                            { value: "", label: "Select" },
                            { value: "male", label: "Male" },
                            { value: "female", label: "Female" },
                            { value: "other", label: "Other" },
                        ]}
                    />
                    {isVendor && (
                        <div>
                            <label className="block font-semibold">
                                W9 Path <span className="text-red-600">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative inline-block border border-gray-light rounded-md p-1">
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        disabled={!isEditable}
                                        accept="image/*"
                                        required={isVendor && adminData?.w9path?.length === 0}
                                        className="absolute inset-0 opacity-0 py-1 w-full"
                                    />
                                    <span className="text-gray-dark">Choose File</span>
                                </div>
                                {adminData?.w9path?.length > 0 ? (
                                    <div className="flex items-center gap-1">
                                        <ImageModal
                                            imageUrl={typeof adminData.w9path[0] === 'string' ?
                                                adminData.w9path[0] :
                                                imageUrl}
                                            className="w-8 h-8 rounded-lg object-cover"
                                        />
                                        <CrossButton
                                            className="w-8 h-8"
                                            onClick={handleRemoveImage}
                                            disabled={!isEditable}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray">No file selected</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Address Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomInput
                            label="Street Line 1"
                            name="address.street1"
                            value={adminData.address.street1}
                            onChange={handleInputChange}
                            readOnly={!isEditable}
                            validationKey="street"
                            required
                        />
                        <CustomInput
                            label="Street Line 2"
                            name="address.street2"
                            value={adminData.address.street2}
                            readOnly={!isEditable}
                            onChange={handleInputChange}
                            validationKey="street"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <CustomInput
                            label="City"
                            name="address.city"
                            value={adminData.address.city}
                            onChange={handleInputChange}
                            readOnly={!isEditable}
                            validationKey="cityorstate"
                            required
                        />
                        <CustomInput
                            label="State"
                            name="address.state"
                            value={adminData.address.state}
                            onChange={handleInputChange}
                            readOnly={!isEditable}
                            validationKey="cityorstate"
                            required
                        />
                        <CustomInput
                            label="Zip Code"
                            name="address.zip"
                            value={adminData.address.zip}
                            onChange={handleInputChange}
                            readOnly={!isEditable}
                            minLength={3}
                            maxLength={10}
                            required
                        />
                    </div>
                </div>

                {/* Kitchen Address Section (Conditional) */}
                {isVendor && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Kitchen Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomInput
                                label="Street Line 1"
                                name="kitchen_address.street1"
                                value={adminData.kitchen_address.street1}
                                onChange={handleInputChange}
                                readOnly={!isEditable}
                                validationKey="street"
                                required
                            />
                            <CustomInput
                                label="Street Line 2"
                                name="kitchen_address.street2"
                                value={adminData.kitchen_address.street2}
                                readOnly={!isEditable}
                                onChange={handleInputChange}
                                validationKey="street"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <CustomInput
                                label="City"
                                name="kitchen_address.city"
                                value={adminData.kitchen_address.city}
                                onChange={handleInputChange}
                                readOnly={!isEditable}
                                validationKey="cityorstate"
                                required
                            />
                            <CustomInput
                                label="State"
                                name="kitchen_address.state"
                                value={adminData.kitchen_address.state}
                                onChange={handleInputChange}
                                readOnly={!isEditable}
                                validationKey="cityorstate"
                                required
                            />
                            <CustomInput
                                label="Zip Code"
                                name="kitchen_address.zip"
                                value={adminData.kitchen_address.zip}
                                onChange={handleInputChange}
                                readOnly={!isEditable}
                                minLength={3}
                                maxLength={10}
                                required
                            />
                        </div>
                    </div>
                )}
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
                    {isEditable && <ButtonWithIcon
                        type="submit"
                        text="Save"
                        variant="confirm"
                    />}
                </div>
            </div>
        </form>

    )
}