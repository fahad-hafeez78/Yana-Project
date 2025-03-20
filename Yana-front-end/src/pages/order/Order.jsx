import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import ExportOrderIcon from '../../assets/export-orders.svg';
import PlaceOrderIcon from '../../assets/place-order.svg';
import OrderAllTab from '../../components/orders/oderAllTabs/OrderAllTabs.jsx';
import { useDispatch } from 'react-redux';
import ordersMiddleware from '../../redux/middleware/ordersMiddleware.js';
import dropdown from "../../assets/dropdown.svg";
import ExportOrders from '../../components/orders/exportOrders/ExportOrders.jsx';
import vendorsMiddleware from '../../redux/middleware/vendorsMiddleware.js';

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [allOrders, setallOrders] = useState();
  const [filteredOrders, setFilteredOrders] = useState();
  const [baseFilteredOrders, setBaseFilteredOrders] = useState();
  const [isLoading, setisLoading] = useState(true);
  const [isExportOrders, setisExportOrders] = useState(false);

  const [VendorDishStats, setVendorDishStats] = useState([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState({
    startDay: null,
    closeDay: null,
  });

  const [activeOption, setActiveOption] = useState(null); // Track the active option
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false); // Track the state of sub-dropdown
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const dropdownRef = useRef(null);
  const subDropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setisLoading(true);

      try {
        // Fetch orders
        const ordersResponse = await dispatch(ordersMiddleware.GetAllOrders());
        const ordersData = ordersResponse.data;
        setallOrders(ordersData);
        setFilteredOrders(ordersData);
        setBaseFilteredOrders(ordersData);

        // Fetch vendor stats
        const vendorStatsResponse = await dispatch(vendorsMiddleware.GetVendorDishStats());
        setVendorDishStats(vendorStatsResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setisLoading(false); // Hide spinner
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const fetchStartCutData = async () => {
      try {
        const response = await dispatch(ordersMiddleware.GetStartCut());
        if (response.success) {
          if (response.data.length > 0) {
            setSelectedDays({
              startDay: response.data[0].startDay,
              closeDay: response.data[0].closeDay,
            });
          }
        } else {
          console.log("Error Fetch Start & Cut Off Day");
        }
      } catch (error) {
        console.error("Error fetching start cut:", error);
      }
    };

    fetchStartCutData();
  }, [dispatch]);

  useEffect(() => {
    const PostData = async () => {
      try {
        const response = await dispatch(ordersMiddleware.UpsrtStartCut(selectedDays));
        if (response.success) {
          console.log("Start and Cut Off Day Successfully Saved.");
        } else {
          console.log("Error Fetch Start & Cut Off Day");
        }
      } catch (error) {
        console.error("Error fetching start cut:", error);
      }
    };
    if (selectedDays.startDay && selectedDays.closeDay) {
      setIsDropdownOpen(false);
      PostData();
    }
  }, [selectedDays]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both dropdowns
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        subDropdownRef.current && !subDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsSubDropdownOpen(false);
        setActiveOption(null);
      } else if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !isSubDropdownOpen) {
        // If only the main dropdown is open, close it
        setIsDropdownOpen(false);
      }
    };

    // Attach event listener on mount and clean up on unmount
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSubDropdownOpen]);

  const handlePlaceOrderClicking = () => {
    navigate('/orders/placeorder');
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    if (isDropdownOpen) {
      // If the main dropdown is already open, close it and reset sub-dropdown
      setIsDropdownOpen(false);
      setIsSubDropdownOpen(false);
      setActiveOption(null);
    } else {
      // Otherwise, open the main dropdown
      setIsDropdownOpen(true);
    }
  };

  // Handle option click (either "Order Start Day" or "Order Close Day")
  const handleOptionClick = (option) => {
    if (activeOption === option) {
      // If the clicked option is already active, close the sub-dropdown
      setIsSubDropdownOpen(false);
      setActiveOption(null);
    } else {
      // Otherwise, open the sub-dropdown for the selected option
      setActiveOption(option);
      setIsSubDropdownOpen(true);
    }
  };

  // Handle day selection
  const handleDaySelection = (day) => {
    if (activeOption === "Order Start Day") {
      setSelectedDays((prevState) => ({ ...prevState, startDay: day }));
    } else if (activeOption === "Order Close Day") {
      setSelectedDays((prevState) => ({ ...prevState, closeDay: day }));
    }

    // Close the sub-dropdown when a day is selected
    setIsSubDropdownOpen(false);

    // If both days are selected, close the main dropdown
    if (selectedDays.startDay && selectedDays.closeDay) {
      setIsDropdownOpen(false);
    }

    // Reset the active option after day selection
    setActiveOption(null);
  };

  // Get the next 4 days after the selected start day, including the start day itself
  const getNext4Days = (startDay) => {
    const startIndex = daysOfWeek.indexOf(startDay);
    if (startIndex === -1) return [];
    const days = [...daysOfWeek.slice(startIndex), ...daysOfWeek.slice(0, startIndex)];
    return days.slice(0, 4); // Only return the next 4 days (including the start day)
  };

  // Get the available close days based on the selected start day
  const availableCloseDays = selectedDays.startDay ? getNext4Days(selectedDays.startDay) : [];

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex gap-3 justify-end items-center">
          <ButtonWithIcon
            onClick={handlePlaceOrderClicking}
            icon={<img src={PlaceOrderIcon} alt="import file" width={18} height={18} />}
            text="Place Order"
            className="bg-custom-blue text-white px-3 py-2 rounded-full"
          />
          <ButtonWithIcon
            onClick={() => setisExportOrders(true)}
            icon={<img src={ExportOrderIcon} alt="download file" width={18} height={18} />}
            text="Export Orders"
            className="bg-red-600 text-white px-3 py-2 rounded-full"
          />

          {/* Main Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <ButtonWithIcon
              onClick={toggleDropdown}
              icon={<img src={dropdown} alt="dropdown" width={24} height={24} />}
              text=""
              className="bg-transparent py-2 rounded-full"
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md z-50">
                {/* First option: Order Start Day */}
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleOptionClick("Order Start Day")}
                >
                  Order Start Day
                  {selectedDays.startDay && (
                    <div className="text-gray-500 text-sm">{selectedDays.startDay}</div>
                  )}
                </div>

                {/* Second option: Order Close Day */}
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleOptionClick("Order Close Day")}
                >
                  Order Close Day
                  {selectedDays.closeDay && (
                    <div className="text-gray-500 text-sm">{selectedDays.closeDay}</div>
                  )}
                </div>

                {/* Sub-dropdown for days (only visible when an option is selected) */}
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
            )}
          </div>
        </div>
        <OrderAllTab
          allOrders={allOrders}
          filteredOrders={filteredOrders}
          setFilteredOrders={setFilteredOrders}
          baseFilteredOrders={baseFilteredOrders}
          setBaseFilteredOrders={setBaseFilteredOrders}
          isLoading={isLoading}
        />
      </div>

      {isExportOrders && (
        <ExportOrders
          allOrders={filteredOrders}
          VendorDishStats={VendorDishStats}
          setisExportOrders={setisExportOrders}
        />
      )}
    </>
  );
};

export default Orders;
