import CrossButton from "../../../elements/crossButton/CrossButton";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";

const CPTPopUpModel = ({
    selectedCPT,
    authUnits,
    setAuthUnits,
    frequency,
    setFrequency,
    cptType,
    formData,
    setFormData,
    isPopupOpen,
    setIsPopupOpen,
}) => {
    if (!isPopupOpen) return null;

    const handleSaveClick = () => {
        const updatedFormData = { ...formData };

        if (cptType === "mcpt") {
            // For MCPT, we only want one code at a time
            // So we'll completely replace any existing values
            updatedFormData.insurance.mcpt = selectedCPT;
            updatedFormData.insurance.m_auth_units_approved = authUnits.toString();
            updatedFormData.insurance.m_frequency = frequency;
        } else if (cptType === "pcpt") {
            // For PCPT, we'll keep the existing behavior (multiple allowed)
            const currentPCPT = updatedFormData.insurance.pcpt ? updatedFormData.insurance.pcpt.split(",").map(c => c.trim()) : [];
            const currentAuthUnits = updatedFormData.insurance.p_auth_units_approved ? updatedFormData.insurance.p_auth_units_approved.split(",").map(a => a.trim()) : [];
            const currentFrequency = updatedFormData.insurance.p_frequency ? updatedFormData.insurance.p_frequency.split(",").map(f => f.trim()) : [];

            const index = currentPCPT.indexOf(selectedCPT);

            if (index !== -1) {
                currentAuthUnits[index] = authUnits.toString();
                currentFrequency[index] = frequency;
            } else {
                currentPCPT.push(selectedCPT);
                currentAuthUnits.push(authUnits.toString());
                currentFrequency.push(frequency);
            }

            updatedFormData.insurance.pcpt = currentPCPT.filter(Boolean).join(", ");
            updatedFormData.insurance.p_auth_units_approved = currentAuthUnits.filter(Boolean).join(", ");
            updatedFormData.insurance.p_frequency = currentFrequency.filter(Boolean).join(", ");
        }

        setFormData(updatedFormData);
        setIsPopupOpen(false);
    };

    const handleAuthUnitChange = (e) => {
        let newUnits = e.target.value;

        // Remove leading zeros as the user types
        newUnits = newUnits.replace(/^0+/, ""); // This will remove all leading zeros

        // If the input is empty after removing leading zeros, set it to "0"
        if (newUnits === "") {
            newUnits = "0";
        }

        // Convert to integer and ensure it's within valid range
        let parsedUnits = parseInt(newUnits, 10) || 0;

        if (cptType === "mcpt") {
            parsedUnits = Math.min(parsedUnits, 62); // Max 62 for mcpt
        } else if (cptType === "pcpt") {
            parsedUnits = Math.min(parsedUnits, 9); // Max 9 for pcpt
        }

        setAuthUnits(parsedUnits);
    };

    const handleFrequencyChange = (e) => {
        setFrequency(e.target.value);
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">

                <div className="absolute top-2 right-2">
                    <CrossButton onClick={() => setIsPopupOpen(false)} />
                </div>

                <h3 className="text-xl mb-4">
                    CPT Code{" "}
                    <span className="ml-4 bg-gray-400 rounded-lg p-1">
                        {selectedCPT}
                    </span>
                </h3>

                <div className="flex mb-4">
                    <div className="flex items-center">
                        <label className="w-40 mr-2">Auth Units:</label>
                        <input
                            type="number"
                            value={authUnits || null}
                            onChange={handleAuthUnitChange}
                            className="w-full p-2 border border-gray-light rounded"
                            max={cptType === "pcpt" ? 9 : 62}
                            min={0}
                        />
                    </div>
                </div>

                <div className="flex mb-4">
                    <div className="flex items-center">
                        <label className="w-40 mr-2">Frequency:</label>
                        <select
                            value={frequency || "N/A"}
                            onChange={handleFrequencyChange}
                            className="w-full p-2 border border-gray-light rounded"
                        >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-center mt-4">
                    <ButtonWithIcon
                        onClick={handleSaveClick}
                        text="Save"
                        variant="confirm"
                    />
                </div>
            </div>
        </div>
    );
};

export default CPTPopUpModel;