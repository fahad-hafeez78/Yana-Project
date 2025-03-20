import React from "react";
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

        if (cptType === "MCpt") {
          
            const currentPCPT = updatedFormData.MCPT ? updatedFormData?.MCPT?.split(",").map(c => c.trim()) : [];
            const currentAuthUnits = updatedFormData.MAuthUnitsApproved ? updatedFormData?.MAuthUnitsApproved?.split(",").map(a => a.trim()) : [];
            const currentFrequency = updatedFormData.MFrequency ? updatedFormData.MFrequency?.split(",")?.map(f => f.trim()) : [];

            // Check if the CPT code is already in the list
            const index = currentPCPT.indexOf(selectedCPT);

            if (index !== -1) {
                // If CPT code is found, update its auth units and frequency
                currentAuthUnits[index] = authUnits.toString();
                currentFrequency[index] = frequency;
            } else {
                // If CPT code is not selected, add it to the arrays
                currentPCPT.push(selectedCPT);
                currentAuthUnits.push(authUnits.toString());
                currentFrequency.push(frequency);
            }

            // Update the formData with the new values (filter out any empty values)
            updatedFormData.MCPT = currentPCPT.filter(Boolean).join(", ");
            updatedFormData.MAuthUnitsApproved = currentAuthUnits.filter(Boolean).join(", ");
            updatedFormData.MFrequency = currentFrequency.filter(Boolean).join(", ");


        } else if (cptType === "PCpt") {
            // Split the comma-separated values into arrays (or use empty arrays if undefined)
            const currentPCPT = updatedFormData.PCPT ? updatedFormData.PCPT.split(",").map(c => c.trim()) : [];
            const currentAuthUnits = updatedFormData.PAuthUnitsApproved ? updatedFormData.PAuthUnitsApproved.split(",").map(a => a.trim()) : [];
            const currentFrequency = updatedFormData.PFrequency ? updatedFormData.PFrequency.split(",").map(f => f.trim()) : [];

            // Check if the CPT code is already in the list
            const index = currentPCPT.indexOf(selectedCPT);

            if (index !== -1) {
                // If CPT code is found, update its auth units and frequency
                currentAuthUnits[index] = authUnits.toString();
                currentFrequency[index] = frequency;
            } else {
                // If CPT code is not selected, add it to the arrays
                currentPCPT.push(selectedCPT);
                currentAuthUnits.push(authUnits.toString());
                currentFrequency.push(frequency);
            }

            // Update the formData with the new values (filter out any empty values)
            updatedFormData.PCPT = currentPCPT.filter(Boolean).join(", ");
            updatedFormData.PAuthUnitsApproved = currentAuthUnits.filter(Boolean).join(", ");
            updatedFormData.PFrequency = currentFrequency.filter(Boolean).join(", ");
        }
        
        // Update the formData state
        setFormData(updatedFormData);
        setIsPopupOpen(false); // Close the modal after saving
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
    
        if (cptType === "MCpt") {
            parsedUnits = Math.min(parsedUnits, 62); // Max 62 for MCPT
        } else if (cptType === "PCpt") {
            parsedUnits = Math.min(parsedUnits, 9); // Max 9 for PCPT
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
                            value={authUnits || 0}
                            onChange={handleAuthUnitChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            max={cptType === "PCpt" ? 9 : 62}
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
                            className="w-full p-2 border border-gray-300 rounded"
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
                        className="bg-custom-blue border text-white px-10 py-1 rounded-full text-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default CPTPopUpModel;