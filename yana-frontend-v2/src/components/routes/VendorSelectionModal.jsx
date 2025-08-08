import { useEffect, useState } from "react";
import CrossButton from "../../elements/crossButton/CrossButton";
import CustomDropdown from "../../elements/customDropdown/CustomDropdown";
import vendorsMiddleware from "../../redux/middleware/vendorsMiddleware";
import { useDispatch } from "react-redux";
import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon";

export default function VendorSelectionModal({ isLoading, onCancel, onConfirm }) {

    const dispatch = useDispatch()
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState("");

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await dispatch(vendorsMiddleware.GetAllVendors("active"));
                if (response.success) {
                    const options = response?.vendors?.map(role => ({
                        value: role._id,
                        label: role.name,
                    }));
                    setVendors([{ value: "", label: "Select" }, ...options]);
                }
            } catch (error) {
                console.error("Error Fetching Vendors:", error);
            }
        };
        fetchVendors();
    }, []);

    const handleConfirmVendor = (e) => {
        e.preventDefault();
        onConfirm(selectedVendor);
    }
    return (
        <form onSubmit={handleConfirmVendor} className="absolute top-32 right-20 z-10 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="flex flex-col bg-white rounded-xl shadow-lg p-6 w-100 gap-4" aria-orientation="vertical">

                <CrossButton onClick={onCancel} className="absolute top-3 right-3 text-gray hover:text-gray-dark" />

                <CustomDropdown
                    label="Select Vendor"
                    name="vendor"
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    options={vendors}
                />

                <div className="flex justify-center space-x-4">
                    <ButtonWithIcon
                        type="button"
                        onClick={onCancel}
                        text="Discard"
                        variant="discard"
                    />
                    <ButtonWithIcon
                        type="submit"
                        text="Confirm"
                        variant="confirm"
                        disabled={isLoading}
                    />
                </div>
            </div>
        </form>
    );
}
