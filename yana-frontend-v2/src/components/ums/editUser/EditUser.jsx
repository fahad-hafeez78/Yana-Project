import { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import umsMiddleware from '../../../redux/middleware/umsMiddleware.js';
import { useDispatch } from 'react-redux';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import { showErrorAlert } from '../../../redux/actions/alertActions.js';
import Spinner from '../../../elements/customSpinner/Spinner.jsx';
import UserFormFields from '../formFields/UserFormFields.jsx';
import usePhoneFormatter from '../../../util/phoneFormatter/phoneFormatter.jsx';

const EditUser = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const { UserData: userdata, isEditable, isDeletePermission } = location.state || {};

    const isVendor = userdata?.unified_user?.role?.name === "vendor";

    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [adminData, setAdminData] = useState({
        name: userdata.name,
        phone: userdata.phone,
        email: userdata?.unified_user?.email,
        address: {
            street1: userdata?.address?.street1,
            street2: userdata?.address?.street2,
            city: userdata?.address?.city,
            state: userdata?.address?.state,
            zip: userdata?.address?.zip,
        },
        kitchen_address: {
            street1: userdata?.kitchen_address?.street1,
            street2: userdata?.kitchen_address?.street2,
            city: userdata?.kitchen_address?.city,
            state: userdata?.kitchen_address?.state,
            zip: userdata?.kitchen_address?.zip,
        },
        timezone: userdata?.timezone,
        gender: userdata?.gender,
        roleId: userdata?.unified_user?.role?.name,
        w9path: Array.isArray(userdata.w9path) ? userdata.w9path : [userdata.w9path],
    });

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
                [name]: value, // Update other fields
            }));
        }
    };

    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = usePhoneFormatter(value);

        setAdminData((prevData) => ({
            ...prevData,
            [name]: formattedValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (adminData?.phone.length < 14) {
                dispatch(showErrorAlert("Enter Valid Phone number"));
                return;
            }
            const formData = new FormData();

            // Append primitive fields
            formData.append("name", adminData.name);
            formData.append("phone", adminData.phone);
            formData.append("email", adminData.email);
            formData.append("gender", adminData.gender);

            // Append address fields
            formData.append("address", JSON.stringify(adminData.address));

            if (isVendor) {
                formData.append("kitchen_address", JSON.stringify(adminData.kitchen_address));

                if (adminData.w9path === null || adminData.w9path.length === 0) {
                    dispatch(showErrorAlert("Select W9 Path"))
                    return;
                }
                adminData.w9path.forEach(file => formData.append('w9path', file));
            }

            setIsLoading(true);
            const response = await dispatch(umsMiddleware.UpdateAdmin(userdata?.unified_user?._id, formData));
            if (response.success) {
                navigate('/users');
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
    const handleRemoveImage = () => {
        setAdminData((prev) => ({
            ...prev,
            w9path: null,
        }));
    };

    const handleCancel = (e) => {
        e.preventDefault();
        navigate(-1);
    };

    if (isLoading) {
        return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
    }

    const roles = [{
        value: userdata?.unified_user?.role?.name,
        label: userdata?.unified_user?.role?.name
    }]
    return (
        <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Edit User</h1>
                <CrossButton onClick={() => navigate(-1)} className="text-gray hover:text-gray-dark" />
            </div>
            <UserFormFields
                adminData={adminData}
                handleInputChange={handleInputChange}
                handlePhoneChange={handlePhoneChange}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                isVendor={isVendor}
                imageUrl={imageUrl}
                roles={roles}
                isEditable={isEditable}
                isRoleDisabled
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
            />
        </div>
    );
};

export default EditUser;
