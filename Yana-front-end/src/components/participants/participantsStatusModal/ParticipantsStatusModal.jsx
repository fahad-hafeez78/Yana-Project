import React, { useState } from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import DatePicker from "react-datepicker";

const ParticipantsStatusModal = ({ formData, setformData, onConfirm, onCancel }) => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);

    const [dates, setDates] = useState({
        pauseStartDate: null,
        pauseEndDate: null,
    });

    const [checkboxSelected, setCheckboxSelected] = useState(false);
    const [error, setError] = useState({
        pauseStartDateError: false,
        pauseEndDateError: false,
        checkboxError: false,
    });

    const formatDate = (date) => {
        if (!(date instanceof Date) || isNaN(date)) return "";
        const formatter = new Intl.DateTimeFormat("en-US");
        const [month, day, year] = formatter
            .formatToParts(date)
            .reduce(
                (acc, part) => {
                    if (part.type === "month") acc[0] = part.value;
                    if (part.type === "day") acc[1] = part.value;
                    if (part.type === "year") acc[2] = part.value;
                    return acc;
                },
                []
            );
        return `${month}-${day}-${year}`;
    };

    const handleConfirm = () => {
        const { pauseStartDate, pauseEndDate } = dates;

        if (!checkboxSelected && (!pauseStartDate || !pauseEndDate)) {
            setError({
                pauseStartDateError: !pauseStartDate && !checkboxSelected,
                pauseEndDateError: !pauseEndDate && !checkboxSelected,
                checkboxError: !checkboxSelected && (!pauseStartDate || !pauseEndDate),
            });
            return;
        } else {
            setError({ pauseStartDateError: false, pauseEndDateError: false, checkboxError: false });

            if (checkboxSelected) {
                onConfirm(formData);
            } else {
                const appendDates = {
                    ...formData,
                    PauseStartDt: formatDate(pauseStartDate),
                    PauseEndDt: formatDate(pauseEndDate),
                };
                onConfirm(appendDates);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">
                <CrossButton onClick={onCancel} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" />

                <h2 className="text-2xl text-gray-500 text-center font-bold">Pause Participant</h2>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <h5 className="text-gray-500 font-bold">Pause Start Date</h5>
                        <DatePicker
                            selected={dates.pauseStartDate}
                            onChange={(date) => {
                                setError((prev) => ({ ...prev, pauseStartDateError: false, checkboxError: false }));
                                setDates((prev) => ({ ...prev, pauseStartDate: date }));
                            }}
                            dateFormat="MM-dd-yyyy"
                            placeholderText="Select start date"
                            minDate={today}
                            maxDate={maxDate}
                            className="border border-gray-300 p-1 rounded-md"
                            disabled={checkboxSelected}
                        />
                        {error.pauseStartDateError && (
                            <span className="text-red-500 text-sm">Please select a start date.</span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <h5 className="text-gray-500 font-bold">Pause End Date</h5>
                        <DatePicker
                            selected={dates.pauseEndDate}
                            onChange={(date) => {
                                setError((prev) => ({ ...prev, pauseEndDateError: false, checkboxError: false }));
                                setDates((prev) => ({ ...prev, pauseEndDate: date }));
                            }}
                            dateFormat="MM-dd-yyyy"
                            placeholderText="Select end date"
                            minDate={today}
                            maxDate={maxDate}
                            className="border border-gray-300 p-1 rounded-md"
                            disabled={checkboxSelected}
                        />
                        {error.pauseEndDateError && (
                            <span className="text-red-500 text-sm">Please select an end date.</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="undefined-checkbox"
                            checked={checkboxSelected}
                            onChange={(e) => {
                                setCheckboxSelected(e.target.checked);
                                setError((prev) => ({ ...prev, checkboxError: false }));
                                if (e.target.checked) {
                                    setDates({ pauseStartDate: null, pauseEndDate: null });
                                }
                            }}
                        />
                        <label htmlFor="undefined-checkbox" className="text-gray-500">
                            Undefined
                        </label>
                    </div>
                    {error.checkboxError && (
                        <span className="text-red-500 text-sm">Please select either dates or the checkbox.</span>
                    )}
                </div>

                <h3 className="text-gray-400 text-center text-lg font-medium mb-4">
                    Are you sure you want to pause this participant?
                </h3>

                <div className="flex justify-center space-x-2">
                    <button
                        className="font-medium px-4 py-2 bg-gray-200 rounded-full text-gray-800 hover:bg-gray-300"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="font-medium px-4 py-2 bg-custom-blue text-white rounded-full"
                        onClick={handleConfirm}
                    >
                        Pause
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParticipantsStatusModal;
