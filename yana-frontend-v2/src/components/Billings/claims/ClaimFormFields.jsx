import DatePicker from "react-datepicker";
import CustomInput from "../../../elements/customInput/CustomInput";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";
import { useDispatch } from "react-redux";
import { showErrorAlert } from "../../../redux/actions/alertActions";

export default function ({
    formData,
    selectedCustomer,
    filteredCustomers = [],
    setFormData,
    isEditable = true,
    isStatusEditable = true,
    handleInputChange,
    latestOrderByParticipantId = [],
    handleParticipantChange = {},
    latestOrders,
    handleSubmit,
    handleCancel
}) {

    const dispatch = useDispatch();
    const orderStat = latestOrders?.find((order) => order.value === formData.order) || "Not Selected";

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    };

    const handleonSubmit = (e) => {
        e.preventDefault();
        if (orderStat?.status === 'completed') {
            handleSubmit(e);
        }
        else {
            dispatch(showErrorAlert("Order is not Completed yet"))
        }
    };

    return (
        <form onSubmit={(e)=>handleonSubmit(e)} onKeyDown={handleKeyDown} className="flex flex-col flex-grow min-h-0">
            <div className="flex-grow overflow-y-auto px-2 pb-4">
                <div className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="relative">
                            <CustomInput
                                label="Participants"
                                placeholder="Search name..."
                                name="customer"
                                value={selectedCustomer}
                                onChange={handleParticipantChange}
                                required
                                readOnly={!isEditable}
                                validationKey="alphanumeric"
                            />
                            {filteredCustomers.length > 0 && (
                                <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-light rounded-md shadow-lg z-10 max-h-[200px] overflow-y-auto">
                                    {filteredCustomers.map((customer, index) => (
                                        <li
                                            key={index}
                                            onClick={() => latestOrderByParticipantId(customer)}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                        >
                                            {customer?.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <CustomDropdown
                            label="Order Date"
                            name="order"
                            value={formData.order}
                            onChange={handleInputChange}
                            options={latestOrders}
                            required
                            disabled={!isEditable && !isStatusEditable}
                        />
                        <CustomInput
                            label="Order Status"
                            name="orderStatus"
                            value={capitalizeFirstLetter(orderStat?.status)}
                            readOnly
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CustomInput
                            name="claim_num"
                            label="Claim No."
                            value={formData.claim_num}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />
                        <div>
                            <label htmlFor="dob" className="block font-bold">
                                Created Date <span className="text-red-600">*</span>
                            </label>
                            <DatePicker
                                selected={formData.created_date}
                                onChange={(date) => setFormData(prev => ({ ...prev, created_date: date }))}
                                dateFormat="MM-dd-yyyy"
                                placeholderText="Select Created Date"
                                required
                                maxDate={new Date()}
                                disabled={!isEditable && !isStatusEditable}
                                wrapperClassName="w-full"
                                className={`w-full border border-gray-light p-1 rounded-md ${!isEditable && !isStatusEditable ? 'bg-gray-light' : 'bg-gray-100 '}`}
                            />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block font-bold">
                                Date of Birth <span className="text-red-600">*</span>
                            </label>
                            <DatePicker
                                selected={formData?.dob}
                                onChange={(date) => setFormData(prev => ({ ...prev, dob: date }))}
                                dateFormat="MM-dd-yyyy"
                                placeholderText="Select DOB"
                                required
                                disabled
                                wrapperClassName="w-full"
                                className={`w-full border border-gray-light p-1 rounded-md ${!isEditable ? 'bg-gray-light' : 'bg-gray-100 '}`}
                            />
                        </div>

                        {/* Date of Service Fields */}
                        <div>
                            <label htmlFor="from_dos" className="block font-bold">
                                From DOS <span className="text-red-600">*</span>
                            </label>
                            <DatePicker
                                selected={formData.from_dos}
                                onChange={(date) => setFormData(prev => ({ ...prev, to_dos: "", from_dos: date }))}
                                dateFormat="MM-dd-yyyy"
                                placeholderText="Select From DOS"
                                required
                                disabled={!isEditable && !isStatusEditable}
                                wrapperClassName="w-full"
                                className={`w-full border border-gray-light p-1 rounded-md ${!isEditable && !isStatusEditable ? 'bg-gray-light' : 'bg-gray-100 '}`}
                            />
                        </div>
                        <div>
                            <label htmlFor="to_dos" className="block font-bold">
                                To DOS <span className="text-red-600">*</span>
                            </label>
                            <DatePicker
                                selected={formData.to_dos}
                                onChange={(date) => setFormData(prev => ({ ...prev, to_dos: date }))}
                                dateFormat="MM-dd-yyyy"
                                placeholderText="Select To DOS"
                                required
                                disabled={!isEditable && !isStatusEditable}
                                minDate={formData.from_dos}
                                wrapperClassName="w-full"
                                className={`w-full border border-gray-light p-1 rounded-md ${!isEditable && !isStatusEditable ? 'bg-gray-light' : 'bg-gray-100 '}`}
                            />
                        </div>
                        <CustomInput
                            name="insurance"
                            label="Insurance"
                            value={formData.insurance}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />
                        <CustomInput
                            name="memberId"
                            label="Member Id"
                            value={formData.memberId}
                            onChange={handleInputChange}
                            required
                            readOnly
                        />
                        <CustomInput
                            name="facility"
                            label="Facility"
                            value={formData.facility}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />

                        {/* Status and PCPT/MCPT Fields */}
                        <CustomDropdown
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            disabled={!isEditable && !isStatusEditable}
                            options={[
                                { value: "", label: "Select Status" },
                                { value: "in_process", label: "In-process" },
                                { value: "denied", label: "Denied" },
                                { value: "paid", label: "Paid" },
                                { value: "partially_paid", label: "Partially-paid" },
                                { value: "billed", label: "Billed" },
                            ]}
                            required
                        />
                        <CustomInput
                            name="cpt"
                            label="CPT"
                            value={formData.cpt}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />

                        {/* Financial Fields */}
                        <CustomInput
                            name="unit_price"
                            label="Unit Price ($)"
                            type="number"
                            value={formData.unit_price}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />
                        <CustomInput
                            name="units"
                            label="Units"
                            type="number"
                            value={formData.units}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />
                        <CustomInput
                            name="days"
                            label="Days"
                            type="number"
                            value={formData.days}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />
                        <CustomInput
                            name="billed_amount"
                            label="Billed Amount ($)"
                            type="number"
                            value={formData.billed_amount}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />

                        {/* Payment Fields */}
                        <CustomInput
                            name="allowed_amount"
                            label="Allowed Amount ($)"
                            type="number"
                            value={formData.allowed_amount}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />
                        <CustomInput
                            name="paid_amount"
                            label="Paid Amount ($)"
                            type="number"
                            value={formData.paid_amount}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />
                        <div>
                            <label htmlFor="payment_date" className="block font-bold">
                                Payment Date <span className="text-red-600">*</span>
                            </label>
                            <DatePicker
                                selected={formData.payment_date}
                                onChange={(date) => setFormData(prev => ({ ...prev, payment_date: date }))}
                                dateFormat="MM-dd-yyyy"
                                placeholderText="Select Payment Date"
                                wrapperClassName="w-full"
                                required
                                disabled={!isEditable && !isStatusEditable}
                                className={`w-full border border-gray-light p-1 rounded-md ${!isEditable && !isStatusEditable ? 'bg-gray-light' : 'bg-gray-100 '}`}
                            />
                        </div>

                        {/* Check and Comment Fields */}
                        <CustomInput
                            name="check"
                            label="Check"
                            value={formData.check}
                            onChange={handleInputChange}
                            readOnly={!isEditable && !isStatusEditable}
                            required
                        />
                        <div className="md:col-span-2">
                            <CustomInput
                                name="comment"
                                label="Comment"
                                value={formData.comment}
                                onChange={handleInputChange}
                                readOnly={!isEditable && !isStatusEditable}
                                multiline
                                rows={3}
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
                    {isStatusEditable && <ButtonWithIcon
                        type="submit"
                        text="Save"
                        variant="confirm"
                    />}
                </div>
            </div>
        </form>
    )
}