import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import ordersMiddleware from "../../../redux/middleware/ordersMiddleware";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function OrderCutOffModal({ setIsDropdownOpen }) {

    const dispatch = useDispatch();
    const subDropdownRef = useRef(null);

    const [activeOption, setActiveOption] = useState(null);

    const [selectedDays, setSelectedDays] = useState({
        startDay: null,
        endDay: null,
    });


    const getNext4Days = (startDay) => {
        const startIndex = daysOfWeek.indexOf(startDay);
        if (startIndex === -1) return [];
        const days = [...daysOfWeek.slice(startIndex), ...daysOfWeek.slice(0, startIndex)];
        return days.slice(0, 6);
    };


    useEffect(() => {
        const fetchStartCutData = async () => {
            try {
                const response = await dispatch(ordersMiddleware.GetStartCut());
                if (response?.success) {
                    setSelectedDays({
                        startDay: response?.duration?.startDay,
                        endDay: response?.duration?.endDay,
                    });
                }
            } catch (error) {
                console.error("Error fetching start cut:", error);
            }
        };
        fetchStartCutData();
    }, []);

    const handleOptionClick = (option) => {
        if (activeOption === option) {
            setActiveOption(null);
        } else {
            setActiveOption(option);
        }
    };

    const handleDaySelection = (day) => {
        setSelectedDays((prevState) => {
            const newState = {
                ...prevState,
                [activeOption === "Order Start Day" ? "startDay" : "endDay"]: day
            };

            if (newState.startDay && newState.endDay) {
                PostData(newState);
                setIsDropdownOpen(false);
            }

            return newState;
        });

        setActiveOption(null);
    };

    const PostData = async (daysState) => {
        try {
            await dispatch(ordersMiddleware.UpsrtStartCut(daysState));
        } catch (error) {
            console.error("Error posting start cut:", error);
        }
    };

    const availableCloseDays = selectedDays.startDay ? getNext4Days(selectedDays.startDay) : [];

    return (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md z-50">
            <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleOptionClick("Order Start Day")}
            >
                Order Start Day
                {selectedDays.startDay && (
                    <div className="text-gray text-sm">{selectedDays.startDay}</div>
                )}
            </div>
            <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleOptionClick("Order Close Day")}
            >
                Order Close Day
                {selectedDays.endDay && (
                    <div className="text-gray text-sm">{selectedDays.endDay}</div>
                )}
            </div>
            {(activeOption === "Order Start Day" || activeOption === "Order Close Day") && (
                <div className="bg-gray-100" ref={subDropdownRef}>
                    {activeOption === "Order Start Day" && daysOfWeek.map((day, index) => (
                        <div
                            key={index}
                            className="cursor-pointer py-1 hover:bg-gray-200 px-4"
                            onClick={() => handleDaySelection(day)}
                        >
                            {day}
                        </div>
                    ))}
                    {activeOption === "Order Close Day" && availableCloseDays.map((day, index) => (
                        <div
                            key={index}
                            className="cursor-pointer py-1 hover:bg-gray-200 px-4"
                            onClick={() => handleDaySelection(day)}
                        >
                            {day}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}