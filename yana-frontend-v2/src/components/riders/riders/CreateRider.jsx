import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import CrossButton from '../../../elements/crossButton/CrossButton.jsx';
import { showErrorAlert } from '../../../redux/actions/alertActions.js';
import vendorsMiddleware from '../../../redux/middleware/vendorsMiddleware.js';
import ridersMiddleware from '../../../redux/middleware/ridersTracking/ridersMiddleware.js';
import CustomerCredentialsModal from '../../participants/participantsCredentialsModal/ParticipantsCredentialsModal.jsx';
import Spinner from '../../../elements/customSpinner/Spinner.jsx';
import usePhoneFormatter from '../../../util/phoneFormatter/phoneFormatter.jsx';
import RiderFormFields from './RiderFormFields.jsx';


const CreateRider = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch()

    // const [zones, setZones] = useState([]);
    const [vendors, setVendors] = useState([]);

    const [imageUrl, setImageUrl] = useState(null);
    const [isCredentialsModalOpen, setisCredentialsModalOpen] = useState(false)

    const [credentials, setCredentials] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [riderData, setRiderData] = useState({
        name: "",
        phone: "",
        email: "",
        // zoneId: '',
        vendorId: "",
        image: '',
        vehicleNumber: '',
        vehicleModel: '',
        address: {
            street1: "",
            street2: "",
            city: "",
            state: "",
            zip: "",
        },
        gender: "",
    });

    useEffect(() => {
        const fetchVendorsAndZones = async () => {
            try {
                // const zonesResponse = await dispatch(zonesMiddleware.GetAllZones());
                // if (zonesResponse && zonesResponse.success) {
                //     setZones(zonesResponse.zones);
                // }

                const vendorsResponse = await dispatch(vendorsMiddleware.GetAllVendors("active"));
                if (vendorsResponse && vendorsResponse.success) {
                    const options = vendorsResponse?.vendors?.map(role => ({
                        value: role._id,
                        label: role.name,
                    }));
                    setVendors([{ value: "", label: "Select" }, ...options]);
                }
            } catch (err) {
            }
        };
        fetchVendorsAndZones();
    }, [])


    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = usePhoneFormatter(value);

        setRiderData((prevData) => ({
            ...prevData,
            [name]: formattedValue,
        }));
    };

    // Handle form field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("address.")) {
            const addressField = name.split(".")[1];
            setRiderData((prevData) => ({
                ...prevData,
                address: {
                    ...prevData.address,
                    [addressField]: value,
                },
            }));
        }

        else {
            setRiderData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleImageUpload = (e) => {
        e.preventDefault();
        const file = Array.from(e.target.files);
        if (file.length > 0) {
            const imageFile = file[0];
            setRiderData((prev) => ({ ...prev, image: file }));

            const objectUrl = URL.createObjectURL(imageFile);
            setImageUrl(objectUrl);
        }
    };

    const handleRemoveImage = () => {
        setRiderData((prev) => ({
            ...prev,
            image: null,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (riderData.zoneId === '' || riderData.zoneId === 'Select') {
        //     dispatch(showErrorAlert("Select Zone"));
        //     return;
        // }
        if (riderData.gender === null) {
            dispatch(showErrorAlert("Select Gender"));
            return;
        }
        if (riderData.vendorId === null || riderData.vendorId === "Select") {
            dispatch(showErrorAlert("Select vendor"));
            return;
        }

        if (riderData.phone.length < 14) {
            dispatch(showErrorAlert("Enter Valid Phone number"));
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();

            // Append primitive fields
            formData.append("name", riderData.name);
            formData.append("phone", riderData.phone);
            formData.append("email", riderData.email);
            formData.append("vendorId", riderData.vendorId);
            formData.append("gender", riderData.gender);

            // Append address fields
            formData.append("address", JSON.stringify(riderData.address));

            // formData.append("zone", riderData.zoneId);
            formData.append("vehicle_no", riderData.vehicleNumber);
            formData.append("vehicle_model", riderData.vehicleModel);

            if (riderData.image && riderData.image.length > 0) {
                for (const file of riderData.image) {
                    formData.append('photo', file);
                }
            }

            const response = await dispatch(ridersMiddleware.CreateRider(formData));
            console.log("response response", response)
            if (response?.success) {
                setCredentials({
                    username: response?.rider.username,
                    password: response?.rider.password
                });
                setisCredentialsModalOpen(true);
            }
        }
        catch (error) {
            console.error("Error Adding Admin.", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = (e) => {
        e.preventDefault();
        navigate(-1);
    };

    const handleModalConfirm = (e) => {
        e.preventDefault();
        navigate(-1);
    };

    if (isLoading) {
        return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
    }

    return (
        <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Create Rider</h1>
                <CrossButton onClick={handleCancel} className="text-gray hover:text-gray-dark" />
            </div>

            <RiderFormFields
                riderData={riderData}
                handleInputChange={handleInputChange}
                imageUrl={imageUrl}
                vendors={vendors}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                handlePhoneChange={handlePhoneChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
            />
            {isCredentialsModalOpen && (
                <CustomerCredentialsModal
                    credentials={credentials}
                    onConfirm={handleModalConfirm}
                />
            )}
        </div>
    );
};

export default CreateRider;
