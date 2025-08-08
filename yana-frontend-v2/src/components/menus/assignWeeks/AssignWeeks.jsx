import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import menusMiddleware from '../../../redux/middleware/menusMiddleware.js';
import weekAssignementMiddleware from '../../../redux/middleware/weekAssignementMiddleware.js';
import Close_Circle from "../../../assets/customIcons/menuIcons/close-circle.svg";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import vendorsMiddleware from '../../../redux/middleware/vendorsMiddleware.js';
import { showErrorAlert } from '../../../redux/actions/alertActions.js';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import Spinner from '../../../elements/customSpinner/Spinner.jsx';

export default function AssignWeeks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation();
  const { vendorId } = location.state;
  const [availableMenus, setAvailableMenus] = useState([]);

  const [validationErrors, setValidationErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);


  const [assignments, setAssignments] = useState({
    week1: { startDate: null, endDate: null, menus: [], isActive: false, _id: null },
    week2: { startDate: null, endDate: null, menus: [], isActive: false, _id: null },
    week3: { startDate: null, endDate: null, menus: [], isActive: false, _id: null },
    week4: { startDate: null, endDate: null, menus: [], isActive: false, _id: null }
  });

  const fetchSelectedVendorMenus = async () => {
    try {
      const response = await dispatch(menusMiddleware.GetMenusByVendorId(vendorId));
      if (response?.success) {
        setAvailableMenus(response?.menus);
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      if (vendorId === null || vendorId === "Select") {
        return;
      }
      const body = {
        "vendorId": vendorId
      }
      const response = await dispatch(weekAssignementMiddleware.GetAllAssignements(body));

      if (response?.assignment) {
        const newAssignments = {
          week1: { startDate: null, endDate: null, menus: [], isActive: false, _id: null },
          week2: { startDate: null, endDate: null, menus: [], isActive: false, _id: null },
          week3: { startDate: null, endDate: null, menus: [], isActive: false, _id: null },
          week4: { startDate: null, endDate: null, menus: [], isActive: false, _id: null }
        };

        // Map API assignments to our week structure
        response.assignment.assignments.forEach((assignment, index) => {
          const weekKey = `week${index + 1}`;
          if (newAssignments[weekKey]) {
            newAssignments[weekKey] = {
              startDate: assignment.startDate,
              endDate: assignment.endDate,
              menus: assignment.menus.map(menu => ({
                ...menu,
                MenuID: menu._id,
                MenuName: menu.name
              })),
              isActive: assignment.isActive,
              _id: assignment._id
            };
          }
        });

        setAssignments(newAssignments);
        setValidationErrors({}); // Clear any existing errors when fetching new assignments
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (vendorId !== null) fetchSelectedVendorMenus();
  }, []);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return null;

    try {
      // First try parsing as ISO format (from API)
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) return date;
      }

      // Then try MM-DD-YYYY format
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const [month, day, year] = parts;
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) return date;
        }
      }

      // Fallback to null if parsing fails
      return null;
    } catch {
      return null;
    }
  };

  const formatDateForAPI = (date) => {
    if (!date) return "";
    try {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    } catch {
      return "";
    }
  };

  const handleDateChange = (weekKey, dateType, date) => {
    setAssignments(prev => {
      const updatedAssignment = { ...prev[weekKey] };
      if (dateType === 'startDate') {
        updatedAssignment.endDate = null;
      }
      updatedAssignment[dateType] = formatDateForAPI(date);
      return {
        ...prev,
        [weekKey]: updatedAssignment
      };
    });

    // Clear validation error when dates change
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[weekKey];
      return newErrors;
    });
  };
  const isValidDate = (date) => {
    return date && !isNaN(new Date(date).getTime());
  };
  const handleAssignMenu = (weekKey, selectedMenu) => {
    setAssignments(prev => ({
      ...prev,
      [weekKey]: {
        ...prev[weekKey],
        menus: [
          ...prev[weekKey].menus,
          {
            ...selectedMenu,
            MenuID: selectedMenu._id,
            MenuName: selectedMenu.name
          }
        ]
      }
    }));

    // Clear validation error when menu is selected
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[weekKey];
      return newErrors;
    });
  };

  const removeMenuFromAssignment = (weekKey, menuToRemove) => {
    setAssignments(prev => ({
      ...prev,
      [weekKey]: {
        ...prev[weekKey],
        menus: prev[weekKey].menus.filter(menu => menu._id !== menuToRemove._id)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    let hasErrors = false;
    let hasAtLeastOneCompleteAssignment = false;
    let hasAnyData = false;

    Object.entries(assignments).forEach(([weekKey, assignment]) => {
      const hasStartDate = assignment.startDate && isValidDate(assignment.startDate);
      const hasEndDate = assignment.endDate && isValidDate(assignment.endDate);
      const hasMenus = assignment.menus.length > 0;
      const isComplete = hasStartDate && hasEndDate && hasMenus;

      if (hasStartDate || hasEndDate || hasMenus) {
        hasAnyData = true;
      }

      if (isComplete) {
        hasAtLeastOneCompleteAssignment = true;
      }

      if (!isComplete && (hasStartDate || hasEndDate || hasMenus)) {
        if (hasMenus && (!hasStartDate || !hasEndDate)) {
          if (!hasStartDate && !hasEndDate) {
            errors[weekKey] = "Please enter both Start Date and End Date.";
          } else if (!hasStartDate) {
            errors[weekKey] = "Please enter Start Date.";
          } else if (!hasEndDate) {
            errors[weekKey] = "Please enter End Date.";
          }
        }
        else if ((hasStartDate || hasEndDate) && !hasMenus) {
          errors[weekKey] = "Please select at least one menu.";
        }
        else if (hasStartDate && !hasEndDate) {
          errors[weekKey] = "Please enter End Date.";
        }
        else if (!hasStartDate && hasEndDate) {
          errors[weekKey] = "Please enter Start Date.";
        }

        hasErrors = true;
      }
    });

    if (!hasAnyData) {
      dispatch(showErrorAlert("Please make at least one complete assignment"));
    }

    setValidationErrors(errors);

    if (hasErrors || !hasAtLeastOneCompleteAssignment) {
      return;
    }

    try {
      // Prepare the payload in the expected API format
      const payload = {
        vendorId: vendorId,
        assignments: Object.values(assignments)
          .filter(assignment => assignment.startDate && assignment.endDate)
          .map(assignment => ({
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            menus: assignment.menus.map(menu => menu._id)
          }))
      };
      setIsLoading(true);
      const response = await dispatch(weekAssignementMiddleware.UpdateAssignments(payload));
      if (response?.success) {
        navigate(-1);
      }
    } catch (error) {
      console.error("Error submitting assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
  }

  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assign Menus</h1>
        <CrossButton onClick={() => navigate(-1)} className="text-gray hover:text-gray-dark" />
      </div>

      {vendorId && vendorId !== "Select" ? (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          {/* Scrollable content area */}
          <div className="flex-grow overflow-y-auto space-y-4">
            {Object.entries(assignments).map(([weekKey, assignment]) => (
              <div key={weekKey} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold mb-1">Start Date</label>
                    <DatePicker
                      selected={isValidDate(assignment.startDate) ? formatDateForDisplay(assignment.startDate) : null}
                      onChange={(date) => handleDateChange(weekKey, 'startDate', date)}
                      dateFormat="MM-dd-yyyy"
                      placeholderText="MM-DD-YYYY"
                      className="w-full px-3 py-1.5 border border-gray-light rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">End Date</label>
                    <DatePicker
                      selected={isValidDate(assignment.endDate) ? formatDateForDisplay(assignment.endDate) : null}
                      onChange={(date) => handleDateChange(weekKey, 'endDate', date)}
                      dateFormat="MM-dd-yyyy"
                      placeholderText="MM-DD-YYYY"
                      minDate={
                        assignment.startDate
                          ? formatDateForDisplay(assignment.startDate)
                          : null
                      }
                      className="w-full px-3 py-1.5 border border-gray-light rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Select Menu</label>
                    <select
                      value=""
                      onChange={(e) => handleAssignMenu(weekKey, JSON.parse(e.target.value))}
                      className="w-full px-3 py-1.5 border border-gray-light rounded-md"
                    >
                      <option value="" disabled>Select Menu</option>
                      {availableMenus
                        .filter(menu => !assignment.menus.some(m => m._id === menu._id))
                        .map((menu) => (
                          <option
                            key={menu._id}
                            value={JSON.stringify(menu)}
                          >
                            {menu.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {assignment.menus.map((menu, idx) => (
                    <span key={idx} className="bg-blue text-white px-3 py-1 rounded-full flex items-center">
                      {menu.name}
                      <button
                        type="button"
                        onClick={() => removeMenuFromAssignment(weekKey, menu)}
                        className="ml-2 text-red-200"
                      >
                        <img src={Close_Circle} height={18} width={18} className='invert' alt="Remove" />
                      </button>
                    </span>
                  ))}
                </div>

                {validationErrors[weekKey] && (
                  <p className="text-red text-sm mt-2">{validationErrors[weekKey]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Sticky footer with action buttons */}
          <div className="sticky bottom-0 bg-white pt-4">
            <div className="flex justify-center gap-4 py-2">
              <ButtonWithIcon
                type="button"
                onClick={() => navigate(-1)}
                text="Discard"
                variant="discard"
              />
              <ButtonWithIcon
                type="submit"
                text="Save"
                variant="confirm"
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="flex-grow flex items-center justify-center text-gray">
          Please select a vendor to assign menus
        </div>
      )}
    </div>
  );
}