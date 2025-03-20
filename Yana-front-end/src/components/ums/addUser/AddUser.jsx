import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import CustomInput from "../../../elements/customInput/CustomInput.jsx";
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import umsMiddleware from '../../../redux/middleware/umsMiddleware.js';
import roleMiddleware from "../../../redux/middleware/roleMiddleware"; // Adjust path based on your structure
import { useDispatch } from 'react-redux';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';

const AddUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  // Initialize state to store admin data, including timezone
  const [adminData, setAdminData] = useState({
    userName: "FH",
    password: "",
    name: "",
    phone: "",
    email: "",
    Address: {
      street1: "",
      street2: "",
      city: "",
      state: "",
      zipcode: "",
    },
    Timezone: "",
    Gender: "Male",
    Role: "",
    Status: "Active",
  });

  // Adding the missing state for roles
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await dispatch(roleMiddleware.GetAllRoles());
        setLoading(false);

        // Assuming the response contains the roles data in response.data
        if (response && response.success) {
          setRoles(response.data); // Set roles data to state
        } else {
          setError('Failed to load roles');
        }
      } catch (err) {
        setLoading(false);
        setError('Failed to load roles');
        console.error('Error fetching roles:', err);
      }
    };

    fetchRoles();
  }, [dispatch]);

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value.replace(/\D/g, '');

    if (formattedValue.length <= 3) {
      formattedValue = `${formattedValue}`;
    } else if (formattedValue.length <= 6) {
      formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3)}`;
    } else if (formattedValue.length <= 10) {
      formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
    } else if (formattedValue.length >= 10) {
      formattedValue = formattedValue.slice(0, 10);
      formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
    }

    // Update the specific phone field based on the input's name attribute
    setAdminData((prevData) => ({
      ...prevData,
      [name]: formattedValue,  // Dynamically update the field specified by the name
    }));
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("Address.")) {
      const addressField = name.split(".")[1]; // Extracts the subfield name like street, city, etc.
      setAdminData((prevData) => ({
        ...prevData,
        Address: {
          ...prevData.Address,
          [addressField]: value, // Update the specific field within Address
        },
      }));
    }
    else if (name === 'email') {
      setEmailError('');
      setAdminData((prevData) => ({
        ...prevData,
        [name]: value, // Update other fields
      }));
    }

    else {
      setAdminData((prevData) => ({
        ...prevData,
        [name]: value, // Update other fields
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...adminData,
        Address: JSON.stringify(adminData.Address), // Convert Address object to a JSON string
    };
      const response = await dispatch(umsMiddleware.AddNewUser(payload));

      if (response.success) {
        navigate('/ums');
      } else {
        console.error("Error Adding Admin.");
      }
    }
    catch (error) {
      console.error("Error Adding Admin.", error);
    }

  };
  const handleEmailBlur = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(adminData.email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };
  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    // <div className="container p-4">
    <div className='flex flex-col gap-2 bg-white p-6 rounded-2xl shadow-md h-[calc(100vh-100px)] overflow-y-auto'>

      <div className='flex justify-between'>
        <h1 className="text-[#959595] font-bold text-2xl">Add User</h1>
        <CrossButton onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700" />
      </div>

      <form onSubmit={handleSubmit} className='px-2'>
        <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
          <div className="flex-1 min-w-[1px]">
            <label htmlFor="name" className="block font-bold mb-[5px]">Name <span className='text-red-600'>*</span></label>
            <CustomInput
              id="name"
              name="name"
              value={adminData.name}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>
          <div className="flex-1 min-w-[1px]">
            <label htmlFor="phone" className="block font-bold mb-[5px]">phone <span className='text-red-600'>*</span></label>
            <CustomInput
              id="phone"
              name="phone"
              value={adminData.phone}
              onChange={handlePhoneChange}
              required
              className="w-full"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
          <div className="flex-1 min-w-[1px]">
            <label htmlFor="email" className="block font-bold mb-[5px]">email <span className='text-red-600'>*</span></label>
            <CustomInput
              id="email"
              name="email"
              value={adminData.email}
              onChange={handleInputChange}
              onBlur={handleEmailBlur}
              required
              className="w-full"
            />
            {emailError && (
              <span className="text-red-600 text-sm">{emailError}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-[10px] mb-[15px] w-full ">
          <div className="flex-1 min-w-[1px]">
            <label htmlFor="Gender" className="block font-bold mb-[5px]">Gender <span className='text-red-600'>*</span></label>
            <select
              id="Gender"
              name="Gender"
              value={adminData.Gender || "Select"}  // Default to "Select" when Gender is not yet selected
              onChange={handleInputChange}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-full bg-gray-100"
              required
            >
              <option value="Select" disabled>Select</option> {/* 'Select' is a placeholder */}
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex-1 min-w-[1px]">
            <label htmlFor="Role" className="block font-bold mb-[5px]">Role <span className='text-red-600'>*</span></label>
            <select
              id="Role"
              name="Role"
              value={adminData.Role || "Select"}  // Default to "Select" when Role is not yet selected
              onChange={handleInputChange}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-full bg-gray-100"
              required
            >
              <option value="Select" disabled>Select</option> {/* 'Select' is a placeholder */}
              {roles.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="text-[#959595] mb-[15px] font-bold text-lg">Address</h2>
        <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
          <div className="flex-1 min-w-[1px]">
            <label htmlFor="street1" className="block font-bold mb-[5px]">
              Street Line1 <span className='text-red-600'>*</span>
            </label>
            <CustomInput
              id="street1"
              name="Address.street1"
              value={adminData.Address.street1}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="flex-1 min-w-[1px]">
            <label htmlFor="street2" className="block font-bold mb-[5px]">
              Street Line2 <span className='text-red-600'>*</span>
            </label>
            <CustomInput
              id="street2"
              name="Address.street2"
              value={adminData.Address.street2}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
          <div className="flex-1 min-w-[1px]">
            <label htmlFor="city" className="block font-bold mb-[5px]">
              City <span className='text-red-600'>*</span>
            </label>
            <CustomInput
              id="city"
              name="Address.city"
              value={adminData.Address.city}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="flex-1 min-w-[1px]">
            <label htmlFor="state" className="block font-bold mb-[5px]">
              State <span className='text-red-600'>*</span>
            </label>
            <CustomInput
              id="state"
              name="Address.state"
              value={adminData.Address.state}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="flex-1 min-w-[1px]">
            <label htmlFor="zipcode" className="block font-bold mb-[5px]">
              Zipcode <span className='text-red-600'>*</span>
            </label>
            <CustomInput
              id="zipcode"
              name="Address.zipcode"
              value={adminData.Address.zipcode}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          {/* <div className="flex-1 min-w-[1px]">
            <label htmlFor="country" className="block font-bold mb-[5px]">
              Country <span className='text-red-600'>*</span>
            </label>
            <CustomInput
              id="country"
              name="Address.country"
              value={adminData.Address.country}
              onChange={handleInputChange}
              className="w-full"
            />
          </div> */}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center gap-2">
          <ButtonWithIcon
            type="buttom"
            onClick={handleCancel}
            text="Discard"
            className="bg-red-600 text-white min-w-[100px] px-3 py-2 rounded-full"
          />
          <ButtonWithIcon
            type="submit"
            text="Save"
            className="bg-custom-blue text-white px-3 py-2 min-w-[100px] rounded-full"
          />
        </div>
      </form>
    </div>
    // </div>
  );
};

export default AddUser;
