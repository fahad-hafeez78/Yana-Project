import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomInput from "../../../elements/customInput/CustomInput";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon.jsx";
import umsMiddleware from "../../../redux/middleware/umsMiddleware.js";
import { useDispatch, useSelector } from "react-redux";
import PasswordInput from "../../../elements/passwordInput/PasswordInput.jsx";
import CrossButton from "../../../elements/crossButton/CrossButton.jsx";
import { updateUser } from "../../../redux/actions/userAction.js";
import Spinner from "../../../elements/customSpinner/Spinner.jsx";
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter.js";
import usePhoneFormatter from "../../../util/phoneFormatter/phoneFormatter.jsx";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown.jsx";
import ImageModal from "../../../elements/imageModal/ImageModal.jsx";

export default function MyProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);

  // Initialize state to store admin data, including timezone
  const [adminData, setAdminData] = useState({
    name: user?.admin_user?.name,
    phone: user?.admin_user?.phone,
    photo: Array.isArray(user?.admin_user?.photo) ? user?.admin_user?.photo : user?.admin_user?.photo === '' ? null : [user?.admin_user?.photo],
    email: user?.email,
    address: {
      street1: user?.admin_user?.address?.street1,
      street2: user?.admin_user?.address?.street2,
      city: user?.admin_user?.address?.city,
      state: user?.admin_user?.address?.state,
      zip: user?.admin_user?.address?.zip,
    },
    gender: user?.admin_user?.gender,
  });
  const [currentPassword, setcurrentPassword] = useState();
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = Array.from(e.target.files); // Convert FileList to an array
    if (file.length > 0) {
      const imageFile = file[0]; // Assuming only one file is selected
      setAdminData((prev) => ({ ...prev, photo: file }));
      // Create an object URL for the selected image
      const objectUrl = URL.createObjectURL(imageFile);
      setImageUrl(objectUrl); // Store the object URL for display
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setAdminData((prev) => {
      return { ...prev, photo: null };
    });
    setImageUrl(null);
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = usePhoneFormatter(value);

    // Update the specific phone field based on the input's name attribute
    setAdminData((prevData) => ({
      ...prevData,
      [name]: formattedValue, // Dynamically update the field specified by the name
    }));
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1]; // Extract the field name (e.g., street, city, etc.)
      setAdminData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value, // Update the specific subfield within address
        },
      }));
    } else {
      setAdminData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = passwordData;
    // Validate new password length and match
    if (newPassword.length < 8) {
      return;
    }
    if (confirmPassword.length === 0) {
      setPasswordError("Enter confirm password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    else {
      try {
        setIsLoading(true);
        const response = await dispatch(
          umsMiddleware.changeUserPassword(
            currentPassword,
            passwordData.newPassword
          )
        );

      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setPasswordError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object
    const formData = new FormData();

    // formData.append("Role", adminData.Role);
    formData.append("phone", adminData.phone);
    formData.append("name", adminData.name);

    formData.append("email", adminData.email);
    formData.append("address", JSON.stringify(adminData.address));
    formData.append("gender", adminData.gender);

    // Append selected images if any
    if (adminData?.photo?.length > 0) {
      for (const file of adminData?.photo) {
        formData.append('photo', file)
      }
    }
    else {
      formData.append('photo', '')
    }

    try {
      setIsLoading(true);
      const response = await dispatch(umsMiddleware.UpdateAdmin(user?._id, formData));
      if (response?.success) {
        dispatch(updateUser());
        navigate('/dashboard')
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  if (isLoading) {
    return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
  }

  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center ">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#959595] font-bold text-2xl">My Profile</h1>
          <div className="w-full flex justify-between">
            <div className="flex w-full flex-col mb-4">
              <h2 className="text-lg font-bold">{user?.admin_user?.name}</h2>
              <p className="text-gray font-semibold">Role: {capitalizeFirstLetter(user?.role?.name)}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          {adminData?.photo?.length > 0 ? (
            <div className="flex flex-col justify-center">
              <ImageModal
                imageUrl={imageUrl || adminData?.photo[0]}
                imageText={user?.admin_user?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                className="text-sm text-green"
                onClick={handleRemoveImage}>
                Remove
              </button>

            </div>
          ) : (
            <>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute w-14 h-14 inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                id="profile-image-input"
              />
              <div className="w-14 h-14 cursor-pointer rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                <span className="text-gray-500 text-xs">Profile</span>
              </div>
            </>
          )}

        </div>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col flex-grow min-h-0">
        {/* Scrollable content area */}
        <div className="flex flex-col flex-grow overflow-y-auto">
          {/* User Information */}

          {/* <div className="w-full flex justify-between">
            <div className="flex w-full flex-col mb-4">
              <h2 className="text-lg font-bold">{user?.admin_user?.name}</h2>
              <p className="text-gray font-semibold">Role: {capitalizeFirstLetter(user?.role?.name)}</p>
            </div>
          </div> */}

          {/* Input Fields */}
          <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
            <div className="flex-1 min-w-[1px]">
              <CustomInput
                label="Name"
                name="name"
                value={adminData.name}
                validationKey="alphanumeric"
                onChange={handleInputChange}
                className="w-full"
                required={true}
              />
            </div>
            <div className="flex-1 min-w-[1px]">
              <CustomInput
                label="Phone"
                name="phone"
                type="tel"
                value={adminData.phone}
                onChange={handlePhoneChange}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
            <div className="flex-1 min-w-[1px]">
              <CustomInput
                label="Email"
                name="email"
                type="email"
                value={adminData.email}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            <div className="flex-1 min-w-[1px]">
              <CustomDropdown
                label="Gender"
                name="gender"
                value={adminData.gender || ""}
                onChange={handleInputChange}
                options={[
                  { value: "", label: "Select" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>
          </div>

          <h2 className="text-[#959595] mb-[15px] font-bold text-lg">Address</h2>
          <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
            <div className="flex-1 min-w-[1px]">
              <CustomInput
                label="Street Line 1"
                name="address.street1"
                value={adminData?.address?.street1}
                onChange={handleInputChange}
                className="w-full"
                validationKey="street"
                required
              />
            </div>
            <div className="flex-1 min-w-[1px]">
              <CustomInput
                label="Street Line 2"
                name="address.street2"
                value={adminData?.address?.street2}
                validationKey="street"
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
            <div className="flex-1 min-w-[1px]">
              <CustomInput
                label="City"
                name="address.city"
                value={adminData?.address?.city}
                onChange={handleInputChange}
                validationKey="cityorstate"
                className="w-full"
                required
              />
            </div>
            <div className="flex-1 min-w-[1px]">
              <CustomInput
                label="State"
                name="address.state"
                value={adminData?.address?.state}
                onChange={handleInputChange}
                validationKey="cityorstate"
                className="w-full"
                required
              />
            </div>
            <div className="flex-1 min-w-[1px]">
              <CustomInput
                label="Zip code"
                name="address.zip"
                value={adminData?.address?.zip}
                onChange={handleInputChange}
                minLength={3}
                maxLength={10}
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Profile Save Buttons */}
          <div className="flex justify-center gap-2 mt-7 mb-6">
            <ButtonWithIcon
              type="button"
              onClick={handleCancel}
              text="Discard"
              variant="discard"
            />
            <ButtonWithIcon
              type="submit"
              text="Save Profile"
              variant="confirm"
            />
          </div>

          <div className="pt-2">
            <h2 className="text-[#959595] mb-[15px] font-bold text-2xl">Change Password</h2>

            <div className="flex gap-[10px]">
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                className="mb-[15px]"
                onChange={(e) => setcurrentPassword(e.target.value)}
                label={
                  <>
                    Current Password <span className="text-red-600">*</span>
                  </>
                }
                validate={false}
              />
              <div className="flex-1"></div>
            </div>

            <div className="flex gap-[10px] mb-[15px] w-full">
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="mb-[15px]"
                label={<>New Password <span className="text-red-600">*</span></>}
                passwordError={passwordError}
              />
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                className="mb-[15px]"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                label={<>Confirm New Password <span className="text-red-600">*</span></>}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <ButtonWithIcon
              type="button"
              onClick={handlePasswordSubmit}
              text="Change Password"
              variant="confirm"
            />
          </div>
        </div>
      </form>
    </div>
  );
}