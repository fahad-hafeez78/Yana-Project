import DatePicker from "react-datepicker";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import CustomInput from "../../../elements/customInput/CustomInput";

export default function ParticipantFormFields({
    formData,
    setFormData,
    actionType,
    handleInputChange,
    vendors,
    handleonRightClick = {},
    handlePhoneChange,
    handleClick,
    isEditable,
    isVendorPermission = true,
    handleSubmit,
    handleCancel
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
                <div className="flex-grow overflow-y-auto px-2 pb-4">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        {/* Name and Member ID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomInput
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                validationKey="alphanumeric"
                                readOnly={!isEditable}
                            />
                            <CustomInput
                                name="memberId"
                                label="Member ID"
                                value={formData.memberId}
                                onChange={handleInputChange}
                                required
                                validationKey="alphanumeric"
                                readOnly={!isEditable}
                            />
                        </div>

                        {/* Medical ID and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <CustomInput
                                name="medicaidId"
                                label="Medical ID"
                                value={formData.medicaidId}
                                onChange={handleInputChange}
                                required
                                validationKey="alphanumeric"
                                readOnly={!isEditable}
                            />

                            <CustomDropdown
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                disabled={!isEditable || formData?.status === "approved"}
                                options={[
                                    { value: "", label: "Select" },
                                    { value: "active", label: "Active" },
                                    { value: "inactive", label: "Inactive" },
                                    ...(actionType === "participant-pending-form" ? [{ value: "approved", label: "Pending" }] : []),
                                    ...(actionType !== "participant-pending-form" && formData?.status === 'approved' ? [{ value: "approved", label: "Approved" }] : [])
                                ]}
                            />
                        </div>

                        {/* DOB and Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="dob" className="block font-bold">
                                    Date of Birth <span className="text-red-600">*</span>
                                </label>
                                <DatePicker
                                    selected={formData.dob}
                                    onChange={(date) => setFormData(prev => ({ ...prev, dob: date }))}
                                    dateFormat="MM-dd-yyyy"
                                    placeholderText="Select DOB"
                                    maxDate={new Date()}
                                    required
                                    readOnly={!isEditable}
                                    wrapperClassName="w-full"
                                    className="w-full border border-gray-light bg-gray-100 p-1 rounded-md"
                                />
                            </div>

                            <CustomInput
                                name="phone"
                                label="Client Phone No."
                                type="tel"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                readOnly={!isEditable}
                                required
                            />
                        </div>

                        {/* Gender and Vendor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomDropdown
                                label="Gender"
                                name="gender"
                                value={formData?.gender}
                                onChange={handleInputChange}
                                disabled={!isEditable}
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
                                disabled={!(isVendorPermission && isEditable)}
                                value={formData.vendorId}
                                onChange={handleInputChange}
                                options={vendors}
                                required={isEditable}
                            />
                        </div>

                        {/* Dates Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start_date" className="block font-bold">
                                    Start Date
                                </label>
                                <DatePicker
                                    selected={formData.start_date}
                                    onChange={(date) => setFormData(prev => ({ ...prev, end_date: null, start_date: date }))}
                                    dateFormat="MM-dd-yyyy"
                                    wrapperClassName="w-full"
                                    placeholderText="Select start date"
                                    readOnly={!isEditable}
                                    className="w-full border border-gray-light bg-gray-100 p-1 rounded-md"
                                />
                            </div>
                            <div>
                                <label htmlFor="end_date" className="block font-bold">
                                    End Date
                                </label>
                                <DatePicker
                                    selected={formData.end_date}
                                    onChange={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                                    dateFormat="MM-dd-yyyy"
                                    wrapperClassName="w-full"
                                    placeholderText="Select end date"
                                    readOnly={!isEditable}
                                    minDate={formData.start_date}
                                    className="w-full border border-gray-light bg-gray-100 p-1 rounded-md"
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-dark">Address Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    name="address.street1"
                                    label="Street Line 1"
                                    value={formData.address.street1}
                                    onChange={handleInputChange}
                                    required
                                    validationKey="street"
                                    readOnly={!isEditable}
                                />
                                <CustomInput
                                    name="address.street2"
                                    label="Street Line 2"
                                    value={formData.address.street2}
                                    onChange={handleInputChange}
                                    validationKey="street"
                                    readOnly={!isEditable}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <CustomInput
                                    label="City"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleInputChange}
                                    required
                                    validationKey="cityorstate"
                                    readOnly={!isEditable}
                                />
                                <CustomInput
                                    name="address.state"
                                    label="State"
                                    value={formData.address.state}
                                    onChange={handleInputChange}
                                    required
                                    readOnly={!isEditable}
                                    validationKey="cityorstate"
                                />
                                <CustomInput
                                    label="Zip Code"
                                    name="address.zip"
                                    value={formData.address.zip}
                                    onChange={handleInputChange}
                                    readOnly={!isEditable}
                                    required
                                    minLength={3}
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-dark">Medical Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    name="icd10code"
                                    label="ICD-10 Code"
                                    value={formData.icd10code}
                                    onChange={handleInputChange}
                                    readOnly={!isEditable}
                                    required
                                />
                                <CustomInput
                                    name="io_type"
                                    label="IO Type"
                                    value={formData.io_type}
                                    onChange={handleInputChange}
                                    readOnly={!isEditable}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    name="auth_number_facets"
                                    label="Auth Number Facets"
                                    value={formData.auth_number_facets}
                                    readOnly={!isEditable}
                                    onChange={handleInputChange}
                                    required
                                />
                                <CustomInput
                                    name="allergies"
                                    label="Allergies"
                                    value={formData.allergies}
                                    readOnly={!isEditable}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Insurance Details */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-dark">Insurance Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold">
                                        MCPT
                                    </label>
                                    <div className="flex gap-2">
                                        {["W1759", "W1760", "W1764"].map((CPTcode) => {
                                            const isSelected = formData.insurance.mcpt?.includes(CPTcode);
                                            const authUnits = formData.insurance.m_auth_units_approved || 0;
                                            const frequency = formData.insurance.m_frequency || 'Weekly';

                                            return (
                                                <button
                                                    type="button"
                                                    disabled={!isEditable}
                                                    className={`flex-1 py-2 px-4 rounded ${isSelected ? "bg-[#0E6D99] text-white" : "bg-white border border-gray-light"}`}
                                                    onClick={() => handleClick(isSelected, CPTcode, 'mcpt', authUnits, frequency)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        handleonRightClick(isSelected, CPTcode, 'mcpt', authUnits, frequency);
                                                    }}
                                                >
                                                    {CPTcode}
                                                    {isSelected && (
                                                        <span className="ml-2 text-sm text-white">
                                                            ({authUnits} AU, {frequency})
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-semibold">PCPT</label>
                                    <div className="flex gap-2">
                                        {["W1894", "W1895"].map((CPTcode) => {
                                            // Split the comma-separated strings into arrays
                                            const pcptCodes = formData.insurance.pcpt?.split(",").map(c => c.trim()) || [];
                                            const authUnitsArray = formData.insurance.p_auth_units_approved?.split(",").map(a => a.trim()) || [];
                                            const frequencyArray = formData.insurance.p_frequency?.split(",").map(f => f.trim()) || [];

                                            // Find the index of the current CPT code
                                            const codeIndex = pcptCodes.indexOf(CPTcode);
                                            const isSelected = codeIndex !== -1;

                                            // Get the corresponding auth units and frequency if the code is selected
                                            const authUnits = isSelected ? authUnitsArray[codeIndex] : 0;
                                            const frequency = isSelected ? frequencyArray[codeIndex] : 'Monthly';

                                            return (
                                                <button
                                                    type="button"
                                                    disabled={!isEditable}
                                                    className={`flex-1 py-2 px-4 rounded ${isSelected ? "bg-[#0E6D99] text-white" : "bg-white border border-gray-light"}`}
                                                    onClick={() => handleClick(isSelected, CPTcode, 'pcpt', authUnits, frequency)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        handleonRightClick(isSelected, CPTcode, 'pcpt', authUnits, frequency);
                                                    }}
                                                    key={CPTcode}
                                                >
                                                    {CPTcode}
                                                    {isSelected && (
                                                        <span className="ml-2 text-sm text-white">
                                                            ({authUnits} AU, {frequency})
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="w-[50%]">
                                <CustomInput
                                    name="insurance.note"
                                    label="Note"
                                    value={formData.insurance.note}
                                    onChange={handleInputChange}
                                    validationKey="note"
                                    placeholder="Su-1.00 M-1.00 T-1.00 W-1.00 Th-1.00 F-1.00 Sa-1.00 Tot-7.00"
                                    readOnly={!isEditable}
                                    required
                                />
                            </div>
                        </div>

                        {/* Coordinator Details */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-dark">Coordinator Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <CustomInput
                                    name="coordinator.name"
                                    label="Coordinator Name"
                                    value={formData.coordinator.name}
                                    onChange={handleInputChange}
                                    validationKey="alphanumeric"
                                    readOnly={!isEditable}
                                />
                                <CustomInput
                                    name="coordinator.phone"
                                    label="Coordinator Phone No."
                                    type="tel"
                                    value={formData.coordinator.phone}
                                    onChange={handlePhoneChange}
                                    readOnly={!isEditable}
                                />
                                <CustomInput
                                    name="coordinator.email"
                                    label="Coordinator Email"
                                    type="email"
                                    value={formData.coordinator.email}
                                    onChange={handleInputChange}
                                    readOnly={!isEditable}
                                />
                            </div>
                        </div>

                        {/* Alternate Contact */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-dark">Alternate Contact Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <CustomInput
                                    name="alternate_contact.name"
                                    label="Alternate Contact Name"
                                    value={formData.alternate_contact.name}
                                    onChange={handleInputChange}
                                    validationKey="alphanumeric"
                                    readOnly={!isEditable}
                                />
                                <CustomInput
                                    name="alternate_contact.phone"
                                    label="Alternate Contact Phone"
                                    type="tel"
                                    value={formData.alternate_contact.phone}
                                    onChange={handlePhoneChange}
                                    readOnly={!isEditable}
                                />
                                <CustomInput
                                    name="alternate_contact.relation"
                                    label="Relation"
                                    value={formData.alternate_contact.relation}
                                    onChange={handleInputChange}
                                    readOnly={!isEditable}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomInput
                                    name="alternate_contact.address.street1"
                                    label="Alternate Contact Street"
                                    value={formData.alternate_contact.address.street1}
                                    onChange={handleInputChange}
                                    validationKey="street"
                                    readOnly={!isEditable}
                                />
                                <CustomInput
                                    name="alternate_contact.address.street2"
                                    label="Alternate Contact Street 2"
                                    value={formData.alternate_contact.address.street2}
                                    onChange={handleInputChange}
                                    validationKey="street"
                                    readOnly={!isEditable}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <CustomInput
                                    name="alternate_contact.address.city"
                                    label="City"
                                    value={formData.alternate_contact.address.city}
                                    onChange={handleInputChange}
                                    validationKey="cityorstate"
                                    readOnly={!isEditable}
                                />
                                <CustomInput
                                    name="alternate_contact.address.state"
                                    label="State"
                                    value={formData.alternate_contact.address.state}
                                    onChange={handleInputChange}
                                    validationKey="cityorstate"
                                    readOnly={!isEditable}
                                />
                                <CustomInput
                                    name="alternate_contact.address.zip"
                                    label="Zip Code"
                                    value={formData.alternate_contact.address.zip}
                                    onChange={handleInputChange}
                                    readOnly={!isEditable}
                                    minLength={3}
                                    maxLength={10}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky footer with action buttons */}
                <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 mt-auto">
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
        </>
    )
}