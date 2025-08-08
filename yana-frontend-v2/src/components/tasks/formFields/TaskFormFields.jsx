import Checkbox from "../../../elements/checkBox/CheckBox";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import CustomInput from "../../../elements/customInput/CustomInput";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import CrossButton from "../../../elements/crossButton/CrossButton";
import ImageModal from "../../../elements/imageModal/ImageModal";

export default function TaskFormFields({
    newTask,

    user,
    roles,
    selectedRoleMembers,

    areDropdownsDisabled,
    handleInputChange,
    isAssignedToMe,
    imageUrl,
    handleImageUpload,
    handleRemoveImage,
    handleCheckBox,
    isEditable = true,

    handleSubmit,
    handleCancel

}) {

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
            {/* Scrollable content area */}
            <div className="flex-grow overflow-y-auto px-2 space-y-4">
                {/* Title and Document Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                        label="Title"
                        name="title"
                        placeholder="Task Title"
                        value={newTask.title}
                        validationKey="alphanumeric"
                        onChange={handleInputChange}
                        readOnly={!isEditable}
                        required
                    />
                    <div>
                        <label className="block font-semibold">Add Document</label>
                        <div className="flex items-center gap-2">
                            <div className="relative inline-block border border-gray-light rounded-md p-1">
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    disabled={!isEditable}
                                    className="absolute inset-0 opacity-0 py-1 w-full"
                                    id="file-upload"
                                />
                                <span className="text-gray-dark">Choose File</span>
                            </div>
                            {newTask?.image?.length > 0 ? (
                                <div className="flex items-center gap-1">
                                    <ImageModal
                                        imageUrl={imageUrl}
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
                </div>

                {/* Role and Member Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomDropdown
                        label="Role"
                        name="selectedRole"
                        value={newTask.selectedRole}
                        onChange={handleInputChange}
                        options={roles}
                        disabled={isAssignedToMe || !isEditable || areDropdownsDisabled}
                    />

                    <CustomDropdown
                        label="Member"
                        name="selectedMember"
                        value={areDropdownsDisabled ? user?._id : newTask.selectedMember}
                        onChange={handleInputChange}
                        options={selectedRoleMembers}
                        disabled={isAssignedToMe || !isEditable || areDropdownsDisabled || (!newTask.selectedRole || newTask.selectedRole === "Select")}
                    />
                </div>

                {/* Assign to Me Checkbox */}
                <div className="flex items-center gap-2">
                    <Checkbox
                        name="assignToMe"
                        checked={areDropdownsDisabled}
                        onChange={handleCheckBox}
                        disabled={!isEditable}
                    />
                    <span>Assign to me</span>
                </div>

                {/* Description and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="description" className="block font-semibold">
                            Description <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Description"
                            value={newTask.description}
                            onChange={handleInputChange}
                            maxLength={255}
                            className="w-full resize-none min-h-[100px] px-3 py-2 border border-gray-light rounded-md bg-gray-100"
                            required
                            readOnly={!isEditable}
                        />
                    </div>

                    <CustomDropdown
                        label="Status"
                        name="status"
                        value={newTask?.status}
                        disabled={!isEditable}
                        onChange={handleInputChange}
                        options={[
                            { value: null, label: "Select" },
                            { value: "pending", label: "Pending" },
                            { value: "inprogress", label: "Inprogress" },
                            { value: "completed", label: "Completed" },
                        ]}
                    />
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
                    {isEditable &&
                        <ButtonWithIcon
                            type="submit"
                            text="Confirm"
                            variant="confirm"
                        />}
                </div>
            </div>
        </form>
    )
}