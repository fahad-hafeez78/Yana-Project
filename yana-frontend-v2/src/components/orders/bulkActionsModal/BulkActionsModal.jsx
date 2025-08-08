import { useState } from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";

export default function BulkActionsModal({ onCancel, onConfirmStatus }) {
    const [status, setstatus] = useState("");

    const onConfirm = (e) => {
        e.preventDefault();
        onConfirmStatus(status);
    };

    const handleChangeStatus = (e) => {
        e.preventDefault();
        setstatus(e.target.value);
    };
    return (
        <form onSubmit={onConfirm} className="absolute top-32 right-80 z-10 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="flex flex-col bg-white rounded-xl shadow-lg p-6 w-100 gap-4" aria-orientation="vertical">

                <CrossButton onClick={onCancel} className="absolute top-3 right-3 text-gray hover:text-gray-dark" />
                <div>
                    <h2 className="text-2xl text-gray font-bold">
                        Change Status?
                    </h2>
                </div>

                <CustomDropdown
                    label="Change Status to"
                    name="Status"
                    value={status}
                    onChange={handleChangeStatus}
                    options={[
                        { value: "", label: "Select" },
                        { value: "active", label: "Active" },
                        { value: "pending", label: "Pending" },
                        { value: "on the way", label: "On the Way" },
                        { value: "completed", label: "Completed" },
                        { value: "canceled", label: "Canceled" },
                    ]}
                />

                <div className="flex justify-center space-x-4">
                    <ButtonWithIcon
                        type="button"
                        onClick={onCancel}
                        text="Cancel"
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
    );
}
