import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import umsMiddleware from '../../../redux/middleware/umsMiddleware.js';
import roleMiddleware from "../../../redux/middleware/roleMiddleware"; // Adjust path based on your structure
import { useDispatch } from 'react-redux';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import { showErrorAlert } from '../../../redux/actions/alertActions.js';
import Spinner from '../../../elements/customSpinner/Spinner.jsx';
import UserFormFields from '../formFields/UserFormFields.jsx';
import usePhoneFormatter from '../../../util/phoneFormatter/phoneFormatter.jsx';

const AddUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [imageUrl, setImageUrl] = useState(null);
  const [isVendor, setIsVendor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [adminData, setAdminData] = useState({
    name: "",
    phone: "",
    email: "",
    w9path: null,
    address: {
      street1: "",
      street2: "",
      city: "",
      state: "",
      zip: "",
    },
    kitchen_address: {
      street1: "",
      street2: "",
      city: "",
      state: "",
      zip: "",
    },
    gender: "",
    roleId: "",
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {

      setIsLoading(true);

      try {
        const response = await dispatch(roleMiddleware.GetRolesForCurrentUser('user'));

        if (response && response.success) {
          // setRoles(response.roles);
          const options = response?.roles?.map(role => ({
            value: role._id,
            label: role.name,
          }));
          setRoles([{ value: "", label: "Select" }, ...options]);
        }
      } catch (err) {

      } finally {
        setIsLoading(false)
      }
    };
    fetchRoles();
  }, []);

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = usePhoneFormatter(value);

    setAdminData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }));
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setAdminData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value,
        },
      }));
    }
    else if (name.startsWith("kitchen_address.")) {
      const addressField = name.split(".")[1];
      setAdminData((prevData) => ({
        ...prevData,
        kitchen_address: {
          ...prevData.kitchen_address,
          [addressField]: value,
        },
      }));
    }

    else {
      setAdminData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  const handleRoleChange = (e) => {
    const selectedRoleId = e.target.value;
    setAdminData((prevData) => ({
      ...prevData,
      'roleId': selectedRoleId,
    }));
    const selectedRole = roles.find(role => role.value === selectedRoleId);
    if (selectedRole?.label === 'vendor' || selectedRole?.label === 'Vendor') {
      setIsVendor(true)
    }
    else
      setIsVendor(false)

  }
  const handleRemoveImage = () => {
    setAdminData((prev) => ({
      ...prev,
      w9path: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (adminData.gender === null) {
      dispatch(showErrorAlert("Select Gender"))
      return;
    }
    if (adminData.roleId === null || adminData.roleId === "Select") {
      dispatch(showErrorAlert("Select Role"))
      return;
    }
    if (adminData.phone.length < 14) {
      dispatch(showErrorAlert("Enter Valid Phone number"))
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      // Append primitive fields
      formData.append("name", adminData.name);
      formData.append("phone", adminData.phone);
      formData.append("email", adminData.email);
      formData.append("gender", adminData.gender);
      formData.append("roleId", adminData.roleId);

      // Append address fields
      formData.append("address", JSON.stringify(adminData.address));
      formData.append("kitchen_address", JSON.stringify(adminData.kitchen_address));

      if (isVendor) {
        if (adminData.w9path === null || adminData.w9path.length === 0) {
          dispatch(showErrorAlert("Select W9 Path"))
          return;
        }
        formData.append("w9path", adminData.w9path[0]);
      }

      const response = await dispatch(umsMiddleware.AddNewAdmin(formData));
      if (response.success) {
        navigate(-1);
      }
    }
    catch (error) {
      console.error("Error Adding Admin.", error);
    } finally {
      setIsLoading(false);
    }

  };

  const handleImageUpload = (e) => {
    e.preventDefault();
    const file = Array.from(e.target.files); // Convert FileList to an array
    if (file.length > 0) {
      const imageFile = file[0]; // Assuming only one file is selected
      setAdminData((prev) => ({ ...prev, w9path: file }));
      // Create an object URL for the selected image
      const objectUrl = URL.createObjectURL(imageFile);
      setImageUrl(objectUrl); // Store the object URL for display
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };



  if (isLoading) {
    return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
  }

  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Add User</h1>
        <CrossButton onClick={() => navigate(-1)} className="text-gray hover:text-gray-dark" />
      </div>

      <UserFormFields
        adminData={adminData}
        handleInputChange={handleInputChange}
        handleRoleChange={handleRoleChange}
        handlePhoneChange={handlePhoneChange}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}
        isVendor={isVendor}
        imageUrl={imageUrl}
        roles={roles}

        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />
    </div>
  );
};

export default AddUser;
