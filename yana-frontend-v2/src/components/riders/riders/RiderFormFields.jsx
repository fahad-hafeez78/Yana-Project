import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import CrossButton from "../../../elements/crossButton/CrossButton";
import CustomInput from "../../../elements/customInput/CustomInput";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import ImageModal from "../../../elements/imageModal/ImageModal";

export default function ({
    riderData,
    handleInputChange,

    imageUrl,
    vendors,
    handleImageUpload,
    handleRemoveImage,
    handlePhoneChange,
    isEditable = true,
    handleSubmit,
    handleCancel,
}) {

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col flex-grow min-h-0">
                {/* Scrollable content area */}
                <div className="flex-grow overflow-y-auto px-2 space-y-4">
                    {/* Personal Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomInput
                            label="Name"
                            name="name"
                            value={riderData.name}
                            onChange={handleInputChange}
                            required
                            readOnly={!isEditable}
                            validationKey="alphanumeric"
                        />
                        <div>
                            <label className="block font-semibold">Image</label>
                            <div className="flex items-center gap-2">
                                <div className="relative inline-block border border-gray-light rounded-md p-1">
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        key={riderData.image ? 'has-image' : 'no-image'}
                                        className="absolute inset-0 opacity-0 py-1"
                                        disabled={!isEditable}
                                    />
                                    <span className="text-gray-dark">Choose Image</span>
                                </div>
                                {riderData?.image?.length > 0 ? (
                                    <div className="flex items-center gap-1">
                                        <ImageModal
                                            imageUrl={imageUrl || riderData?.image}
                                            className="w-8 h-8 rounded-lg object-cover"
                                        />
                                        <CrossButton
                                            className='w-8 h-8'
                                            onClick={handleRemoveImage}
                                            disabled={!isEditable}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray-dark">No file selected</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomInput
                            label="Email"
                            name="email"
                            type="email"
                            value={riderData.email}
                            onChange={handleInputChange}
                            required
                            readOnly={!isEditable}
                        />
                        <CustomInput
                            label="Phone"
                            name="phone"
                            value={riderData.phone}
                            onChange={handlePhoneChange}
                            required
                            readOnly={!isEditable}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomDropdown
                            label="Gender"
                            name="gender"
                            value={riderData.gender || ""}
                            disabled={!isEditable}
                            onChange={handleInputChange}
                            options={[
                                { value: "", label: "Select" },
                                { value: "male", label: "Male" },
                                { value: "female", label: "Female" },
                                { value: "other", label: "Other" },
                            ]}
                        />
                        <CustomDropdown
                            label="Vendor"
                            name="vendorId"
                            value={riderData.vendorId || ""}
                            disabled={!isEditable}
                            onChange={handleInputChange}
                            options={vendors}
                        />
                    </div>

                    {/* Vehicle Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomInput
                            label="Vehicle Number"
                            name="vehicleNumber"
                            value={riderData.vehicleNumber}
                            onChange={handleInputChange}
                            required
                            minLength={3}
                            maxLength={15}
                            validationKey="vehicleNumber"
                            readOnly={!isEditable}
                        />
                        <CustomInput
                            label="Vehicle Model"
                            name="vehicleModel"
                            minLength={3}
                            maxLength={15}
                            value={riderData.vehicleModel}
                            onChange={handleInputChange}
                            readOnly={!isEditable}
                        />
                    </div>

                    {/* Address Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomInput
                                label="Street Line 1"
                                name="address.street1"
                                value={riderData.address.street1}
                                onChange={handleInputChange}
                                validationKey="street"
                                required
                                readOnly={!isEditable}
                            />
                            <CustomInput
                                label="Street Line 2"
                                name="address.street2"
                                value={riderData.address.street2}
                                validationKey="street"
                                onChange={handleInputChange}
                                readOnly={!isEditable}
                            />
                            <CustomInput
                                label="City"
                                name="address.city"
                                value={riderData.address.city}
                                onChange={handleInputChange}
                                validationKey="cityorstate"
                                required
                                readOnly={!isEditable}
                            />
                            <CustomInput
                                label="State"
                                name="address.state"
                                value={riderData.address.state}
                                onChange={handleInputChange}
                                validationKey="cityorstate"
                                required
                                readOnly={!isEditable}
                            />

                            <CustomInput
                                label="Zip code"
                                name="address.zip"
                                value={riderData.address.zip}
                                onChange={handleInputChange}
                                minLength={3}
                                maxLength={10}
                                required
                                readOnly={!isEditable}
                            />
                        </div>
                    </div>
                </div>

                {/* Sticky footer with action buttons */}
                <div className="sticky bottom-0 bg-white pt-4">
                    <div className="flex justify-center gap-4">
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
        </>
    )
}