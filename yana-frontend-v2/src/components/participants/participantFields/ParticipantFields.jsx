import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import customersMiddleware from "../../../redux/middleware/customersMiddleware.js";
import CrossButton from "../../../elements/crossButton/CrossButton.jsx";
import ParticipantsStatusModal from "../participantsStatusModal/ParticipantsStatusModal.jsx";
import CPTPopUpModel from "./CPTPopupModel.jsx";
import { showErrorAlert } from "../../../redux/actions/alertActions.js";
import umsMiddleware from "../../../redux/middleware/umsMiddleware.js";
import zonesMiddleware from "../../../redux/middleware/ridersTracking/zonesMiddleware.js";
import usePermissionChecker from "../../../util/permissionChecker/PermissionChecker.jsx";
import Spinner from "../../../elements/customSpinner/Spinner.jsx";
import usePhoneFormatter from "../../../util/phoneFormatter/phoneFormatter.jsx";
import ParticipantFormFields from "./ParticipantFormFields.jsx";
import CustomerCredentialsModal from '../participantsCredentialsModal/ParticipantsCredentialsModal';
import vendorsMiddleware from "../../../redux/middleware/vendorsMiddleware.js";

const ParticipantFields = () => {

  const location = useLocation();
  const { memberData: data, isEditable: isEditable = true, actionType: actionType } = location.state || {};

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state?.user)
  const [isModalOpen, setisModalOpen] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCPT, setSelectedCPT] = useState("");
  const [authUnits, setAuthUnits] = useState(0);
  const [frequency, setFrequency] = useState("");

  const [cptType, setcptType] = useState(null);
  const [vendors, setVendors] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [credentials, setCredentials] = useState(null);
  const [isCredentialsModalOpen, setisCredentialsModalOpen] = useState(false)
  // const [zones, setZones] = useState([]);
  const checkPermission = usePermissionChecker();
  const isVendorPermission = checkPermission('vendor', 'view');


  useEffect(() => {
    const fetchVendors = async () => {
      if (isVendorPermission) {
        setIsLoading(true)
        try {
          const response = await dispatch(vendorsMiddleware.GetAllVendors("active"));
          if (response?.success) {
            const options = response?.vendors?.map(role => ({
              value: role._id,
              label: role.name,
            }));
            setVendors([{ value: "", label: "Select" }, ...options]);
          }
        } catch (err) {
          console.error('Error fetching vendors:', err);
        } finally {
          setIsLoading(false)
        }
      }
      else {
        setVendors([{
          value: data?.vendorId?._id,
          label: data?.vendorId?.name,
        }]);
      }

    };

    // const fetchZones = async () => {
    //   try {
    //     const response = await dispatch(zonesMiddleware.GetAllZones());
    //     if (response?.success) {
    //       const options = response?.zones?.map(zone => ({
    //         value: zone._id,
    //         label: zone.name,
    //       }));
    //       setZones([{ value: null, label: "Select" }, ...options]);
    //     }
    //   } catch (err) {
    //     console.error('Error fetching vendors:', err);
    //   }
    // };
    // fetchZones();
    fetchVendors();
  }, []);

  const handleModalConfirm = () => {
    setisCredentialsModalOpen(false);
    navigate('/participants', { state: { refresh: true } });
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
      return phoneNumber;
    }
    let value = phoneNumber.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    if (value.length === 10) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    }

    return value;
  };
  const [formData, setFormData] = useState({

    name: data?.name || "",
    phone: formatPhoneNumber(data?.phone) || "",
    memberId: data?.memberId || "",
    medicaidId: data?.medicaidId || "",
    dob: formatDate(data?.dob) || "",
    status: actionType === 'participant-pending-form' ? 'approved' : data?.status || "",
    vendorId: data?.vendorId?._id || "",
    address: {
      street1: data?.address?.street1 || "",
      street2: data?.address?.street2 || "",
      city: data?.address?.city || "",
      state: data?.address?.state || "",
      zip: data?.address?.zip || "",
    },
    gender: data?.gender || "",
    allergies: data?.allergies || [],

    // insurance details (nested)
    insurance: {
      mcpt: data?.insurance?.mcpt ? data?.insurance?.mcpt?.trim() : "",
      m_auth_units_approved: data?.insurance?.m_auth_units_approved || "",
      m_frequency: data?.insurance?.m_frequency || "",
      pcpt: data?.insurance?.pcpt ? data?.insurance?.pcpt?.trim() : "",
      p_auth_units_approved: data?.insurance?.p_auth_units_approved || "",
      p_frequency: data?.insurance?.p_frequency || "",
      note: data?.insurance?.note || "",
    },

    // coordinator details (nested)
    coordinator: {
      name: data?.coordinator?.name,
      email: data?.coordinator?.email,
      phone: formatPhoneNumber(data?.coordinator?.phone),
    },

    alternate_contact: {
      name: data?.alternate_contact?.name || "",
      phone: formatPhoneNumber(data?.alternate_contact?.phone) || "",
      relation: data?.alternate_contact?.relation,
      address: {
        street1: data?.alternate_contact?.address?.street1 || "",
        street2: data?.alternate_contact?.address?.street1 || "",
        city: data?.alternate_contact?.address?.city || "",
        state: data?.alternate_contact?.address?.state || "",
        zip: data?.alternate_contact?.address?.zip || "",
      },
    },

    // Additional fields
    start_date: formatDate(data?.start_date) || "",
    end_date: formatDate(data?.end_date) || "",
    icd10code: data?.icd10code || "",
    io_type: data?.io_type || "",
    auth_number_facets: data?.auth_number_facets || "",
    // zone: data?.zone,
  });

  function formatDate(isoDateString) {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    // Ensure that the date is valid before formatting
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0]; // Extract yyyy-MM-dd
  }

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = usePhoneFormatter(value);

    // Update the specific phone field based on the input's name attribute
    if (name.startsWith("coordinator.")) {
      const coordinatorField = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        coordinator: {
          ...prevData.coordinator,
          [coordinatorField]: formattedValue,
        },
      }));
    }
    else if (name.startsWith("alternate_contact.")) {
      const alternateContactField = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        alternate_contact: {
          ...prevData.alternate_contact,
          [alternateContactField]: formattedValue,
        },
      }));
    }
    else
      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedValue,
      }));
  };
  const onConfirm = (data) => {
    setFormData({
      ...data,
      status: 'inactive',
    });

    setisModalOpen(false);
  };

  const handleInputChange = (e) => {
    // e.preventDefault();
    const { name, value } = e.target;
    if (name.startsWith("status") && value === 'inactive') {
      setisModalOpen(true)
    }
    else if (name === "allergies") {
      setFormData((prevData) => ({
        ...prevData,
        allergies: value.split(",").map((item) => item.trim()),
      }));
    }
    else if (name.startsWith("coordinator.")) {
      const coordinatorField = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        coordinator: {
          ...prevData.coordinator,
          [coordinatorField]: value,
        },
      }));
    } else if (name.startsWith("insurance.")) {
      const insuranceField = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        insurance: {
          ...prevData.insurance,
          [insuranceField]: value,
        },
      }));
    } else if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [field]: value,
        },
      }));
    } else if (name.startsWith("alternate_contact.address.")) {
      const field = name.split(".")[2];
      setFormData((prevData) => ({
        ...prevData,
        alternate_contact: {
          ...prevData.alternate_contact,
          address: {
            ...prevData.alternate_contact.address,
            [field]: value,
          },
        },
      }));
    } else if (name.startsWith("alternate_contact.")) {
      const field = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        alternate_contact: {
          ...prevData.alternate_contact,
          [field]: value,
        },
      }));
    } else {
      console.log("value value",value)
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleClick = (isSelected, CPTcode, CPTtype, authUnits, frequency) => {

    if (isSelected) {
      handleDeselection(CPTcode, CPTtype);
    } else {

      if (CPTtype === "mcpt") {
        setFormData(prev => ({
          ...prev,
          insurance: {
            ...prev.insurance,
            mcpt: "",
            m_auth_units_approved: "",
            m_frequency: ""
          }
        }));
      }

      setAuthUnits(authUnits);
      setFrequency(frequency);
      setSelectedCPT(CPTcode);
      setcptType(CPTtype);
      setIsPopupOpen(true);
    }
  };

  const handleonRightClick = (isSelected, CPTcode, CPTtype, authUnits, frequency) => {
    if (isSelected) {
      setAuthUnits(authUnits);
      setFrequency(frequency);
      setSelectedCPT(CPTcode);
      setcptType(CPTtype);
      setIsPopupOpen(true);
    }
  };


  const handleDeselection = (CPTcode, CPTtype) => {
    const updatedFormData = { ...formData };

    if (CPTtype === "mcpt") {
      const currentPCPT = updatedFormData.insurance.mcpt.split(",").map(c => c.trim());
      const currentAuthUnits = updatedFormData.insurance.m_auth_units_approved.split(",").map(a => a.trim());
      const currentFrequency = updatedFormData.insurance.m_frequency.split(",").map(f => f.trim());

      // Find the index of the CPT code
      const index = currentPCPT.indexOf(CPTcode);

      if (index !== -1) {
        // Remove the CPT code and corresponding auth units and frequency
        currentPCPT.splice(index, 1);
        currentAuthUnits.splice(index, 1);
        currentFrequency.splice(index, 1);
      }

      // Update the formData with the new values
      updatedFormData.insurance.mcpt = currentPCPT.join(", ");
      updatedFormData.insurance.m_auth_units_approved = currentAuthUnits.join(", ");
      updatedFormData.insurance.m_frequency = currentFrequency.join(", ");
    } else if (CPTtype === "pcpt") {
      const currentPCPT = updatedFormData.insurance.pcpt.split(",").map(c => c.trim());
      const currentAuthUnits = updatedFormData.insurance.p_auth_units_approved.split(",").map(a => a.trim());
      const currentFrequency = updatedFormData.insurance.p_frequency.split(",").map(f => f.trim());

      // Find the index of the CPT code
      const index = currentPCPT.indexOf(CPTcode);

      if (index !== -1) {
        // Remove the CPT code and corresponding auth units and frequency
        currentPCPT.splice(index, 1);
        currentAuthUnits.splice(index, 1);
        currentFrequency.splice(index, 1);
      }

      // Update the formData with the new values
      updatedFormData.insurance.pcpt = currentPCPT.join(", ");
      updatedFormData.insurance.p_auth_units_approved = currentAuthUnits.join(", ");
      updatedFormData.insurance.p_frequency = currentFrequency.join(", ");
    }

    setFormData(updatedFormData);
  };

  const AddParticipant = async (sanitizedFormData) => {
    try {
      const response = await dispatch(customersMiddleware.CreateCustomer(sanitizedFormData));

      if (response?.success) {
        setCredentials({
          username: response?.customer.username,
          password: response?.customer.password
        });
        setisCredentialsModalOpen(true);
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  }
  const UpdateParticipant = async (participantId, sanitizedFormData) => {
    try {
      const response = await dispatch(customersMiddleware.UpdateCustomer(participantId, sanitizedFormData));
      if (response?.success) {
        navigate(-1);
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  }
  const UpdateParticipantPendingForm = async (participantId, sanitizedFormData) => {
    try {
      const response = await dispatch(customersMiddleware.UpdateCustomer(participantId, sanitizedFormData));
      if (response?.success) {
        navigate(-1);
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData?.insurance?.mcpt && !formData?.insurance?.pcpt) {
      dispatch(showErrorAlert("Select Meals or Pers CPT"));
      return;
    }
    if (formData.phone.length < 14) {
      dispatch(showErrorAlert("Enter Valid Phone number"));
      return;
    }
    setIsLoading(true)
    const fieldsToSanitize = ["mcpt", "m_auth_units_approved", "m_frequency", "pcpt", "p_auth_units_approved", "p_frequency"];
    const sanitizedFormData = { ...formData };

    fieldsToSanitize.forEach((field) => {
      if (sanitizedFormData.insurance[field]) {
        // Ensure the field is a string before calling .replace
        if (typeof sanitizedFormData.insurance[field] === 'string') {
          sanitizedFormData.insurance[field] = sanitizedFormData.insurance[field]
            .replace(/^(,|\s)+|(\s|,)+$/g, "");
        }
        // If it's an array or a non-string value, you might want to handle it differently
        // For example, you can convert numbers to strings if necessary
        else if (Array.isArray(sanitizedFormData.insurance[field])) {
          sanitizedFormData.insurance[field] = sanitizedFormData.insurance[field].join(', ').replace(/^(,|\s)+|(\s|,)+$/g, "");
        }
        else {
          // You could convert numbers to strings, if needed
          sanitizedFormData.insurance[field] = sanitizedFormData.insurance[field].toString().replace(/^(,|\s)+|(\s|,)+$/g, "");
        }
      }
    });

    if (actionType === 'add-participant') {
      AddParticipant(sanitizedFormData);
    }
    else if (actionType === 'update-participant') {
      UpdateParticipant(data?._id, sanitizedFormData)
    }
    else if (actionType === 'participant-pending-form') {
      UpdateParticipantPendingForm(data?._id, sanitizedFormData)
    }

  };

  const displayPageTitle = () => {
    if (actionType === 'add-participant') {
      return 'Add Participant';
    }
    else if (actionType === 'update-participant') {
      return 'Participant Details';
    }
    else if (actionType === 'participant-pending-form') {
      return 'Participant Details';
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1)
  };

  if (isLoading) {
    return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
  }

  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[#959595] font-bold text-2xl">{displayPageTitle()}</h1>
        <CrossButton onClick={handleCancel} className="text-gray hover:text-gray-dark" />
      </div>

      <ParticipantFormFields
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleonRightClick={handleonRightClick}
        vendors={vendors}
        handlePhoneChange={handlePhoneChange}
        isEditable={isEditable}
        handleClick={handleClick}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        actionType={actionType}
      />

      {/* Modals */}
      <CPTPopUpModel
        selectedCPT={selectedCPT}
        authUnits={authUnits}
        setAuthUnits={setAuthUnits}
        setFormData={setFormData}
        isPopupOpen={isPopupOpen}
        setIsPopupOpen={setIsPopupOpen}
        cptType={cptType}
        formData={formData}
        frequency={frequency}
        setFrequency={setFrequency}
      />
      {isModalOpen && (
        <ParticipantsStatusModal
          formData={formData}
          onCancel={() => setisModalOpen(false)}
          onConfirm={onConfirm}
        />
      )}
      {isCredentialsModalOpen && (
        <CustomerCredentialsModal
          credentials={credentials}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
};

export default ParticipantFields;