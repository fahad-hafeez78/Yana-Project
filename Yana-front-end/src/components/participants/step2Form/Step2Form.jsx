import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomInput from "../../../elements/customInput/CustomInput.jsx";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon.jsx";
import { useDispatch } from "react-redux";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown.jsx";
import customersMiddleware from "../../../redux/middleware/customersMiddleware.js";
import CrossButton from "../../../elements/crossButton/CrossButton.jsx";
import CPTPopUpModel from "../cptPopupModel/CPTPopupModel.jsx";

const Step2Form = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { memberData: data } = location.state || {};
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCPT, setSelectedCPT] = useState("");
  const [authUnits, setAuthUnits] = useState(0);
  const [authUnitIndex, setAuthUnitIndex] = useState(null);
  const [frequency, setFrequency] = useState("");

  const [cptType, setcptType] = useState(null);

  useEffect(() => {
    if (data) {
      // Use memberData here
      console.log("Received member data:", data);
    }
  }, [data]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic details
    Name: "",
    Phone: "",
    MemberID: "",
    MedicaidID: "",
    MemberDOB: "",
    Status: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zipcode: "",
    Gender: "",
    Allergies: "",
    Note: "",
    // Insurance nested object
    // Insurance: {
    MCPT: "",
    MAuthUnitsApproved: "",
    MFrequency: "",
    PCPT: "",
    PAuthUnitsApproved: "",
    PFrequency: "",
    // },
    // 
    // Coordinator nested object
    // Coordinator: {
    coordinatorName: "",
    coordinatorEmail: "",
    coordinatorPhone: "",
    // },

    // Alternate contact details
    alternateContactName: "",
    alternateContactPhone: "",
    // AlternateContactAddress: {
    alternateContactStreet1: "",
    alternateContactStreet2: "",
    alternateContactCity: "",
    alternateContactState: "",
    alternateContactZipcode: "",
    // },

    // Additional fields
    StartDT: "",
    EndDT: "",
    ICD10Code: "",
    IOType: "",
    AuthNumberFacets: "",
  });

  function formatDate(isoDateString) {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    // Ensure that the date is valid before formatting
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0]; // Extract yyyy-MM-dd
  }

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

  useEffect(() => {
    if (data) {
      // const coordinator = data.Coordinator;
      // const insurance = data.Insurance;

      setFormData({
        // Basic details
        // PotentialCustomerID: data._id.toString(),
        Name: data.Name,
        Phone: formatPhoneNumber(data.Phone),
        MemberID: data.MemberID,
        MedicaidID: data.MedicaidID,
        MemberDOB: formatDate(data.MemberDOB),
        Status: data.Status,
        street1: data.street1 || "",
        street2: data.street2 || "",
        city: data.city || "",
        state: data.state || "",
        zipcode: data.zipcode || "",
        Gender: data.Gender || "",
        Allergies: data.Allergies || "",
        Note: data?.Note || "",

        // Insurance: {
        MCPT: data.MCPT ? data.MCPT.trim() : "",
        MAuthUnitsApproved: data.MAuthUnitsApproved || "",
        MFrequency: data.MFrequency || "",
        PCPT: data.PCPT ? data.PCPT.trim() : "",
        PAuthUnitsApproved: data.PAuthUnitsApproved || "",
        PFrequency: data.PFrequency || "",
        // },
        // Coordinator: {
        coordinatorName: data.coordinatorName,
        coordinatorEmail: data.coordinatorEmail,
        coordinatorPhone: formatPhoneNumber(data.coordinatorPhone),
        // },

        // Alternate contact details
        alternateContactName: data.alternateContactName || "",
        alternateContactPhone: formatPhoneNumber(data.alternateContactPhone) || "",
        // AlternateContactAddress: {
        alternateContactStreet1: data.alternateContactStreet1 || "",
        alternateContactStreet2: data.alternateContactStreet2 || "",
        alternateContactCity: data.alternateContactCity || "",
        alternateContactState: data.alternateContactState || "",
        alternateContactZipcode: data.alternateContactZipcode || "",
        // },

        // Additional fields
        StartDT: formatDate(data.StartDT) || "",
        EndDT: formatDate(data.EndDT) || "",
        ICD10Code: data.ICD10Code || "",
        IOType: data.IOType || "",
        AuthNumberFacets: data.AuthNumberFacets || "",
      });
    }
  }, [data]);

  const sendFormData = async (formData) => {
    try {
      const updatedFormData = {
        ...formData,
        Status: "Approved",
      };

      const response = await dispatch(
        customersMiddleware.UpdateCustomer(data._id, updatedFormData)
      );

      if (response.success) {
        console.log("Updates sent.");
      } else {
        console.error("Error sending form data:", response.message);
      }
    } catch (error) {
      console.error("Error sending form data:", error);
    }
  };

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
    // if (name.startsWith("Coordinator.")) {
    //   const coordinatorField = name.split(".")[1];
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     Coordinator: {
    //       ...prevData.Coordinator,
    //       [coordinatorField]: formattedValue,
    //     },
    //   }));
    // }
    // else
    setFormData((prevData) => ({
      ...prevData,
      [name]: formattedValue,  // Dynamically update the field specified by the name
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // if (name.startsWith("Coordinator.")) {
    //   const coordinatorField = name.split(".")[1];
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     Coordinator: {
    //       ...prevData.Coordinator,
    //       [coordinatorField]: value,
    //     },
    //   }));
    // } else if (name.startsWith("Insurance.")) {
    //   const insuranceField = name.split(".")[1];
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     Insurance: {
    //       ...prevData.Insurance,
    //       [insuranceField]: value,
    //     },
    //   }));
    // } else if (name.startsWith("Address.") || name.startsWith("AlternateContactAddress.")) {
    //   const addressType = name.startsWith("Address.") ? "Address" : "AlternateContactAddress";
    //   const field = name.split(".")[1];
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     [addressType]: {
    //       ...prevData[addressType],
    //       [field]: value,
    //     },
    //   }));
    // } else {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // }
  };

  const handleClick = (isSelected, CPTcode, CPTtype, authUnits, frequency) => {

    if (isSelected) {

      // Deselect the CPT code
      handleDeselection(CPTcode, CPTtype);

    } else {

      // Set the CPT code and open the modal
      setAuthUnits(authUnits);
      setFrequency(frequency);
      setSelectedCPT(CPTcode);
      setcptType(CPTtype);
      setIsPopupOpen(true);

    }
  };

  const handleDeselection = (CPTcode, CPTtype) => {

    const updatedFormData = { ...formData };

    if (CPTtype === "MCpt") {

      const currentPCPT = updatedFormData.MCPT.split(",").map(c => c.trim());
      const currentAuthUnits = updatedFormData.MAuthUnitsApproved.split(",").map(a => a.trim());
      const currentFrequency = updatedFormData.MFrequency.split(",").map(f => f.trim());

      // Find the index of the CPT code
      const index = currentPCPT.indexOf(CPTcode);

      if (index !== -1) {
        // Remove the CPT code and corresponding auth units and frequency
        currentPCPT.splice(index, 1);
        currentAuthUnits.splice(index, 1);
        currentFrequency.splice(index, 1);
      }

      // Update the formData with the new values
      updatedFormData.MCPT = currentPCPT.join(", ");
      updatedFormData.MAuthUnitsApproved = currentAuthUnits.join(", ");
      updatedFormData.MFrequency = currentFrequency.join(", ");

    } else if (CPTtype === "PCpt") {
      const currentPCPT = updatedFormData.PCPT.split(",").map(c => c.trim());
      const currentAuthUnits = updatedFormData.PAuthUnitsApproved.split(",").map(a => a.trim());
      const currentFrequency = updatedFormData.PFrequency.split(",").map(f => f.trim());

      // Find the index of the CPT code
      const index = currentPCPT.indexOf(CPTcode);

      if (index !== -1) {
        // Remove the CPT code and corresponding auth units and frequency
        currentPCPT.splice(index, 1);
        currentAuthUnits.splice(index, 1);
        currentFrequency.splice(index, 1);
      }

      // Update the formData with the new values
      updatedFormData.PCPT = currentPCPT.join(", ");
      updatedFormData.PAuthUnitsApproved = currentAuthUnits.join(", ");
      updatedFormData.PFrequency = currentFrequency.join(", ");
    }

    // Update the formData state
    setFormData(updatedFormData);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldsToSanitize = ["MCPT", "MAuthUnitsApproved", "MFrequency", "PCPT", "PAuthUnitsApproved", "PFrequency"];
    const sanitizedFormData = { ...formData };


    fieldsToSanitize.forEach((field) => {
      if (sanitizedFormData[field]) {
        // Ensure the field is a string before calling .replace
        if (typeof sanitizedFormData[field] === 'string') {
          sanitizedFormData[field] = sanitizedFormData[field]
            .replace(/^(,|\s)+|(\s|,)+$/g, "");
        }
        // If it's an array or a non-string value, you might want to handle it differently
        // For example, you can convert numbers to strings if necessary
        else if (Array.isArray(sanitizedFormData[field])) {
          sanitizedFormData[field] = sanitizedFormData[field].join(', ').replace(/^(,|\s)+|(\s|,)+$/g, "");
        }
        else {
          // You could convert numbers to strings, if needed
          sanitizedFormData[field] = sanitizedFormData[field].toString().replace(/^(,|\s)+|(\s|,)+$/g, "");
        }
      }
    });

    sendFormData(sanitizedFormData);
    navigate(-1, { state: { refresh: true } });
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className="bg-white p-5 rounded-2xl">
      <div className="flex flex-col font-['Poppins',sans-serif] gap-4">

        <div className='flex justify-between'>
          <h1 className="text-[#959595] font-bold text-2xl">Fill Client Details</h1>
          <CrossButton onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="h-[calc(100vh-240px)] px-2 overflow-y-auto">
            {/* Client Details */}
            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="Name" className="block font-bold ">
                  Client Name <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="MemberID" className="block font-bold ">
                  Member ID <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="MemberID"
                  name="MemberID"
                  value={formData.MemberID}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="MedicaidID" className="block font-bold ">
                  Medicaid ID <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="MedicaidID"
                  name="MedicaidID"
                  value={formData.MedicaidID}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="Status" className="block font-bold ">
                  Status <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="Status"
                  name="Status"
                  value={formData.Status}
                  onChange={handleInputChange}
                  readOnly={true}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="Gender" className="block font-bold ">
                  Gender <span className='text-red-600'>*</span>
                </label>
                <CustomDropdown
                  id="Gender"
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleInputChange}
                  placeholder="Select Gender"
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="MemberDOB" className="block font-bold ">
                  Date of Birth <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  type="date"
                  id="MemberDOB"
                  name="MemberDOB"
                  value={formData.MemberDOB}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="Phone" className="block font-bold ">
                  Client Phone No.  <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="Phone"
                  name="Phone"
                  type="tel"
                  value={formData.Phone}
                  onChange={handlePhoneChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="street" className="block font-bold ">
                  Street Line 1 <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="street1"
                  name="street1"
                  required
                  value={formData.street1}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="address" className="block font-bold ">
                  street Line 2
                </label>
                <CustomInput
                  id="street2"
                  name="street2"
                  value={formData.street2}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="city" className="block font-bold ">
                  City <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="state" className="block font-bold ">
                  State <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="zipcode" className="block font-bold ">
                  Zipcode <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="zipcode"
                  name="zipcode"
                  required
                  value={formData.zipcode}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Additional Client Details */}
            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="StartDT" className="block font-bold ">
                  Start Date <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  type="date"
                  id="StartDT"
                  name="StartDT"
                  value={formData.StartDT}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="EndDT" className="block font-bold ">
                  End Date <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  type="date"
                  id="EndDT"
                  name="EndDT"
                  value={formData.EndDT}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="ICD10Code" className="block font-bold ">
                  ICD-10 Code <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="ICD10Code"
                  name="ICD10Code"
                  value={formData.ICD10Code}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="IOType" className="block font-bold ">
                  IO Type <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="IOType"
                  name="IOType"
                  value={formData.IOType}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label
                  htmlFor="AuthNumberFacets"
                  className="block font-bold "
                >
                  Auth Number Facets <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="AuthNumberFacets"
                  name="AuthNumberFacets"
                  value={formData.AuthNumberFacets}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="Allergies" className="block font-bold ">
                  Allergies
                </label>
                <CustomInput
                  type="text"
                  id="Allergies"
                  name="Allergies"
                  value={formData.Allergies}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              {/* Insurance Details */}
              <h2 className="text-[#959595] mb-[15px] text-xl w-full text-left">
                Insurance Details
              </h2>

              <div className="flex gap-[10px]">

                <div className="mb-[10px] flex-1">
                  <label className="block font-semibold">
                    MCPT <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-[5px]">
                    {["W1759", "W1760", "W1764"].map((CPTcode) => {
                      const isSelected = formData?.MCPT
                        ?.split(",")
                        .map((c) => c.trim())
                        .includes(CPTcode);

                      // Find the index of the CPT code in the PCPT list
                      const index = formData?.MCPT
                        ?.split(",")
                        .map((c) => c.trim())
                        .indexOf(CPTcode);

                      // Get corresponding authUnits and frequency based on the index
                      const authUnits = formData?.MAuthUnitsApproved
                        ?.split(",")
                        .map((a) => a.trim())[index] || 0;
                      const frequency = formData?.MFrequency
                        ?.split(",")
                        .map((f) => f.trim())[index] || 'Monthly';

                      return (
                        <button
                          type="button"
                          className={`flex-1 py-2 px-4 rounded ${isSelected ? "bg-[#0E6D99] text-white" : "bg-white border border-[#ccc]"
                            } cursor-pointer`}
                          onClick={() => handleClick(isSelected, CPTcode, 'MCpt', authUnits, frequency)}  // Handle single click
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleonRightClick(isSelected, CPTcode, 'MCpt', authUnits, frequency);
                          }}
                        >
                          {CPTcode}
                          <br />
                          {isSelected && (
                            <span className="ml-2 text-sm text-white">
                              ({authUnits} AU, {frequency})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-[10px] flex-1">
                  <label className="block font-semibold">
                    PCPT
                  </label>
                  <div className="flex gap-[5px]">
                    {["W1894", "W1895"].map((CPTcode) => {
                      const isSelected = formData?.PCPT
                        ?.split(",")
                        .map((c) => c.trim())
                        .includes(CPTcode);

                      // Find the index of the CPT code in the PCPT list
                      const index = formData?.PCPT
                        ?.split(",")
                        .map((c) => c.trim())
                        .indexOf(CPTcode);

                      // Get corresponding authUnits and frequency based on the index
                      const authUnits = formData?.PAuthUnitsApproved
                        ?.split(",")
                        .map((a) => a.trim())[index] || 0;
                      const frequency = formData?.PFrequency
                        ?.split(",")
                        .map((f) => f.trim())[index] || 'Monthly';

                      return (
                        <button
                          type="button"
                          className={`flex-1 py-2 px-4 rounded ${isSelected ? "bg-[#0E6D99] text-white" : "bg-white border border-[#ccc]"
                            } cursor-pointer`}
                          onClick={() => handleClick(isSelected, CPTcode, 'PCpt', authUnits, frequency)}  // Handle single click
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleonRightClick(isSelected, CPTcode, 'PCpt', authUnits, frequency);
                          }}

                        >
                          {CPTcode}
                          <br />
                          {isSelected && (
                            <span className="ml-2 text-sm text-white">
                              ({authUnits} AU, {frequency})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>


            {/* Use the AuthUnitsPopup component */}
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

            <div className="flex-1 mt-3 mb-3 min-w-[1px]">
              <label htmlFor="Note" className="block font-bold ">
                Note
              </label>
              <CustomInput
                id="Note"
                name="Note" // Use the correct name
                value={formData.Note}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            {/* Coordinator Details */}
            <h2 className="text-[#959595] mb-[15px] text-xl w-full text-left">
              Coordinator Details
            </h2>
            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label
                  htmlFor="coordinatorName"
                  className="block font-bold "
                >
                  Coordinator Name <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="coordinatorName"
                  name="coordinatorName" // Use the correct name
                  value={formData.coordinatorName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label
                  htmlFor="coordinatorPhone"
                  className="block font-bold "
                >
                  Coordinator Phone No. <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="coordinatorPhone"
                  name="coordinatorPhone"
                  type="tel"
                  value={formData.coordinatorPhone}
                  onChange={handlePhoneChange}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label
                  htmlFor="coordinatorEmail"
                  className="block font-bold "
                >
                  Coordinator Email <span className='text-red-600'>*</span>
                </label>
                <CustomInput
                  id="coordinatorEmail"
                  name="coordinatorEmail" // Use the correct name
                  value={formData.coordinatorEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Alternate Contact */}
            <h2 className="text-[#959595] mb-[15px] text-xl w-full text-left">
              Alternate Contact Details
            </h2>
            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label
                  htmlFor="alternateContactName"
                  className="block font-bold "
                >
                  Alternate Contact Name
                </label>
                <CustomInput
                  id="alternateContactName"
                  name="alternateContactName"
                  value={formData.alternateContactName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[1px]">
                <label
                  htmlFor="alternateContactPhone"
                  className="block font-bold "
                >
                  Alternate Contact Phone
                </label>
                <CustomInput
                  id="alternateContactPhone"
                  name="alternateContactPhone"
                  type="tel"
                  value={formData.alternateContactPhone}
                  onChange={handlePhoneChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="alternateContactStreet1" className="block font-bold ">
                  Alternate Contact Street
                </label>
                <CustomInput
                  id="alternateContactStreet1"
                  name="alternateContactStreet1"
                  value={formData.alternateContactStreet1}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="alternateContactStreet2" className="block font-bold ">
                  Alternate Contact Address
                </label>
                <CustomInput
                  id="alternateContactStreet2"
                  name="alternateContactStreet2"
                  value={formData.alternateContactStreet2}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] mb-[15px] w-full">
              <div className="flex-1 min-w-[1px]">
                <label htmlFor="alternateContactCity" className="block font-bold ">
                  City
                </label>
                <CustomInput
                  id="alternateContactCity"
                  name="alternateContactCity"
                  value={formData.alternateContactCity}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="alternateContactState" className="block font-bold ">
                  State
                </label>
                <CustomInput
                  id="alternateContactState"
                  name="alternateContactState"
                  value={formData.alternateContactState}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[1px]">
                <label htmlFor="alternateContactZipcode" className="block font-bold ">
                  Zip Code
                </label>
                <CustomInput
                  id="alternateContactZipcode"
                  name="alternateContactZipcode"
                  value={formData.alternateContactZipcode}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-3">
            <ButtonWithIcon
              type="buttom"
              onClick={handleCancel}
              text="DIscard"
              className="bg-red-600 border text-white px-10 py-1 rounded-full text-lg flex items-center justify-center"
            />
            <ButtonWithIcon
              type="submit"
              text="Save"
              className="bg-custom-blue border text-white px-10 py-1 rounded-full text-lg flex items-center justify-center"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step2Form;