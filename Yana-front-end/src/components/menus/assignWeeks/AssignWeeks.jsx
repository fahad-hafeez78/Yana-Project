import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import menusMiddleware from '../../../redux/middleware/menusMiddleware.js';
import weekAssignementMiddleware from '../../../redux/middleware/weekAssignementMiddleware.js';
import ordersMiddleware from '../../../redux/middleware/ordersMiddleware.js';
import Close_Circle from "../../../assets/close-circle.svg";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


export default function AssignWeeks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [availableMenus, setavailableMenus] = useState([]);
  const [isAlreadyData, setisAlreadyData] = useState(false);
  const [firstweekassignmentfound, setfirstweekassignmentfound] = useState(false);
  const [assignmentsData, setAssignmentsData] = useState({
    Activeweeks: {
      week1: [{ Startdt: "", Enddt: "", Menus: [] }],
      week2: [{ Startdt: "", Enddt: "", Menus: [] }],
      week3: [{ Startdt: "", Enddt: "", Menus: [] }],
      week4: [{ Startdt: "", Enddt: "", Menus: [] }],
    },
  });

  const fetchMenus = async () => {
    try {
      const response = await dispatch(menusMiddleware.GetAllMenus());
      setavailableMenus(response.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await dispatch(weekAssignementMiddleware.GetAllAssignements());
      if (response.data && Object.keys(response.data).length > 0) {
        const weeks = ["week1", "week2", "week3", "week4"];
        const updatedAssignments = { Activeweeks: {} };

        weeks.forEach((week) => {
          updatedAssignments.Activeweeks[week] = response.data[week].map((weekItem) => ({
            Startdt: weekItem.Startdt || "",
            Enddt: weekItem.Enddt || "",
            Menus: weekItem.Menus || [],
          }));
        });
        setAssignmentsData(updatedAssignments);
        setisAlreadyData(true);
        if (updatedAssignments.Activeweeks["week1"][0].Menus.length > 0) {
          setfirstweekassignmentfound(true);
        }
      } else {
        setfirstweekassignmentfound(false);
        setisAlreadyData(false);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };


  useEffect(() => {
    fetchMenus();
    fetchAssignments();
  }, []);


  const handleAssignMenuToWeek = (weekNumber, selectedMenu) => {
    setAssignmentsData(prevData => ({
      ...prevData,
      Activeweeks: {
        ...prevData.Activeweeks,
        [weekNumber]: [{
          ...prevData.Activeweeks[weekNumber][0],
          Menus: [...prevData.Activeweeks[weekNumber][0].Menus, selectedMenu]
        }]
      }
    }));
  };


  const formatDate = (date) => {
    // Check if the date is valid
    if (!(date instanceof Date) || isNaN(date)) {
      console.error("Invalid date:", date);
      return '';  // Return empty string for invalid date
    }

    // Use Intl.DateTimeFormat for formatting the date in MM-DD-YYYY format
    const formatter = new Intl.DateTimeFormat('en-US');  // USA locale
    const [month, day, year] = formatter.formatToParts(date).reduce((acc, part) => {
      if (part.type === 'month') acc[0] = part.value;
      if (part.type === 'day') acc[1] = part.value;
      if (part.type === 'year') acc[2] = part.value;
      return acc;
    }, []);

    // Return the formatted date as MM-DD-YYYY
    return `${month}-${day}-${year}`;
  };

  // Usage in handleDateChange
  const handleDateChange = (weekKey, dateType, date) => {
    const formattedDate = date ? formatDate(date) : null;

    setAssignmentsData((prevData) => ({
      ...prevData,
      Activeweeks: {
        ...prevData.Activeweeks,
        [weekKey]: [{
          ...prevData.Activeweeks[weekKey][0],
          [dateType]: formattedDate,  // Update with formatted date
        }],
      },
    }));
  };


  // Function to remove a menu from a week
  const removeMenuFromWeek = (week, menuToRemove) => {
    setAssignmentsData((prevState) => {
      const updatedMenus = prevState.Activeweeks[week][0].Menus.filter(
        (menu) => menu.MenuID !== menuToRemove.MenuID
      );
      return {
        ...prevState,
        Activeweeks: {
          ...prevState.Activeweeks,
          [week]: [{ ...prevState.Activeweeks[week][0], Menus: updatedMenus }],
        },
      };
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isAlreadyData && firstweekassignmentfound) {
        // Call update if there are menus assigned
        response = await dispatch(weekAssignementMiddleware.UpdateAssignments(assignmentsData));
      } else {
        // Call create if no menus assigned
        response = await dispatch(weekAssignementMiddleware.CreateAssignments(assignmentsData));
      }

      if (response.success) {
        console.log("Assignement Submitted Successfully.", response)
        navigate(-1);
      } else {
        console.log("Error Submiting Assignemnt", response)
      }
    } catch (error) {
      console.log("Error Submiting Assignemnt", error)
    }
  };

  const [selectedDays, setSelectedDays] = useState({
    startDay: null,
    closeDay: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dispatch(ordersMiddleware.GetStartCut());
        if (response.success) {
          if (response.data.length > 0) {
            setSelectedDays({
              startDay: response.data[1].Data,
              closeDay: response.data[0].Data,
            })
            CheckisFirstWeekDisabled(selectedDays)
          }
        } else {
          console.log("Error Fetch Start & Cut Off Day")
        }
      } catch (error) {
        console.error("Error fetching start cut:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  const CheckisFirstWeekDisabled = (selectedDays) => {
    const startDay = selectedDays.startDay;
    const closeDay = selectedDays.closeDay;
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();

    const startIndex = daysOfWeek.indexOf(startDay);
    const closeIndex = daysOfWeek.indexOf(closeDay);

    const inRange = startIndex < closeIndex
      ? todayIndex >= startIndex && todayIndex < closeIndex
      : todayIndex >= startIndex || todayIndex < closeIndex;

    if (inRange) {
      setisAlreadyData(true);
    } else {
      setisAlreadyData(false);
    }
  };


  return (
    // <div className="flex flex-col h-[calc(100vh-300px)]">
    <div className="bg-white rounded-2xl p-6 shadow-md ">
      <h1 className="text-[#959595] mb-4 font-bold text-2xl">Assign Menus</h1>
      <form onSubmit={handleSubmit} >
        <div className='h-[calc(100vh-250px)] overflow-y-auto'>
          {/* Render your assignments here */}
          {Object.keys(assignmentsData.Activeweeks).map((weekKey, index) => {
            const weekNumber = weekKey;

            const startdt = assignmentsData.Activeweeks[weekNumber][0].Startdt;
            const enddt = assignmentsData.Activeweeks[weekNumber][0].Enddt;

            const isFirstWeek = weekNumber === 'week1' && isAlreadyData && firstweekassignmentfound;
            return (
              <div key={weekNumber} className={`space-y-2 p-4 ${isFirstWeek ? 'bg-gray-100 rounded-lg cursor-not-allowed' : ''}`}>
                <div className="flex justify-between items-center">
                  {/* <div className="font-semibold">{`${startdt} to ${enddt}`}</div> */}
                  <div className='flex gap-2'>
                    <div className='flex flex-col'>
                      <strong>Start date</strong>
                      <DatePicker
                        selected={startdt ? new Date(startdt) : null}
                        onChange={(date) => handleDateChange(weekKey, 'Startdt', date)}
                        dateFormat="MM-dd-yyyy"
                        placeholderText="Select start date"

                        className="border border-gray-300 p-2 rounded-md"
                        disabled={isFirstWeek}
                      />
                    </div>

                    <div className='flex flex-col'>
                      <strong>End date</strong>
                      <DatePicker
                        selected={enddt ? new Date(enddt) : null}
                        onChange={(date) => handleDateChange(weekKey, 'Enddt', date)}
                        dateFormat="MM-dd-yyyy"
                        placeholderText="Select end date"
                        className="border border-gray-300 p-2 rounded-md"
                        disabled={isFirstWeek}
                      />
                    </div>
                  </div>

                  <div className="w-1/4">

                    <select
                      value=""
                      onChange={(e) => handleAssignMenuToWeek(weekNumber, JSON.parse(e.target.value))}
                      className="block w-full border border-gray-300 px-2 py-1 rounded-md"
                      disabled={isFirstWeek}  // Disable dropdown for the first week
                    >
                      <option value="" disabled>Select Menu</option>
                      {availableMenus
                        .filter(menu => !assignmentsData.Activeweeks[weekNumber][0].Menus.some(assignedMenu => assignedMenu.MenuID === menu._id))
                        .map((menu) => (
                          <option key={menu._id} value={JSON.stringify({ MenuID: menu._id, MenuName: menu.name })}>
                            {menu.name}
                          </option>
                        ))
                      }
                    </select>

                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {assignmentsData.Activeweeks[weekNumber][0].Menus.map((menu, idx) => (
                    <span
                      key={idx}
                      className={`bg-custom-blue text-white px-3 py-1 rounded-full flex items-center ${isFirstWeek ? 'opacity-50' : ''}`}
                    >
                      {menu.MenuName}
                      {!isFirstWeek && (
                        <button
                          type="button"
                          onClick={() => removeMenuFromWeek(weekNumber, menu)}
                          className="ml-2 text-red-200"
                        >
                          <img src={Close_Circle} height={18} width={18} className='invert'></img>
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-2">
          <ButtonWithIcon
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
            text="Discard"
            className="bg-red-600 text-white px-3 py-2 min-w-[100px] rounded-full"
          />
          <ButtonWithIcon
            type="submit"
            text="Save"
            className="bg-custom-blue text-white px-3 py-2 min-w-[100px] rounded-full"
          />
        </div>
      </form>

    </div>

  );
};
