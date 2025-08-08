// import React, { useEffect, useState } from 'react';
// import { useNavigate } from "react-router-dom";
// import CustomInput from "../../elements/customInput/CustomInput";
// import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
// import { useDispatch } from 'react-redux';
// import vendorsMiddleware from "../../redux/middleware/vendorsMiddleware.js";
// import roleMiddleware from "../../redux/middleware/roleMiddleware.js";
// import CrossButton from '../../elements/crossButton/CrossButton.jsx';

// const AddVendor = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch()
//   const [attachedFile, setAttachFile] = useState([]);

//   const [vendorData, setVendorData] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     address: {
//       street1: "",
//       street2: "",
//       city: "",
//       state: "",
//       zipcode: "",
//       country: "",
//     },
//   });
//   const [emailError, setEmailError] = useState('');

//   useEffect(() => {
//     const fetchVendorRoleId= async()=>{
//       try {
//         const response = await dispatch(roleMiddleware.GetAllRoles());
//         if (response.success) {
//           console.log("Role", response)
//         }
//       } catch (error) {
//         console.error("Error adding Vendor:", error);
//       }
//     }
//     fetchVendorRoleId()
//   }, []);

//   const handleImageChange = (e) => {
//     const file = Array.from(e.target.files);  // Convert FileList to an array
//     setAttachFile(file);
//   };

//   const handleRemoveImage = () => {
//     setAttachFile([])
//   };

//   const handlePhoneChange = (e) => {
//     const { name, value } = e.target;

//     let formattedValue = value.replace(/\D/g, '');

//     if (formattedValue.length <= 3) {
//       formattedValue = `${formattedValue}`;
//     } else if (formattedValue.length <= 6) {
//       formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3)}`;
//     } else if (formattedValue.length <= 10) {
//       formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
//     } else if (formattedValue.length >= 10) {
//       formattedValue = formattedValue.slice(0, 10);
//       formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
//     }

//     // Update the specific phone field based on the input's name attribute
//     setVendorData((prevData) => ({
//       ...prevData,
//       [name]: formattedValue,  // Dynamically update the field specified by the name
//     }));
//   };

//   // Handle form field changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;

//     if (name.startsWith("address.")) {
//       const addressField = name.split(".")[1]; // Extract the field name (e.g., street, city, etc.)
//       setVendorData((prevData) => ({
//         ...prevData,
//         address: {
//           ...prevData.address,
//           [addressField]: value, // Update the specific subfield within address
//         },
//       }));
//     }
//     if (name === 'email') {
//       setEmailError('');
//       setVendorData((prevData) => ({
//         ...prevData,
//         [name]: value, // Update other fields normally
//       }));
//     }
//     else {
//       setVendorData((prevData) => ({
//         ...prevData,
//         [name]: value, // Update other fields normally
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Create a FormData object
//     const formData = new FormData();
//     formData.append('name', vendorData.name);
//     formData.append('phone', vendorData.phone);
//     formData.append('email', vendorData.email);
//     formData.append('address', JSON.stringify(vendorData.address));

//     // Append the image file if selected
//     if (attachedFile) {
//       for (const file of attachedFile) {
//         formData.append('imagefile', file);
//       }
//     }
//     try {
//       const response = await dispatch(vendorsMiddleware.AddVendor(formData));
//       if (response.success) {
//         console.log("Vendor Added Successfully.");
//         navigate('/vendors');
//       } else {
//         console.error("Error adding Vendor");
//       }
//     } catch (error) {
//       console.error("Error adding Vendor:", error);
//     }
//   };

//   const handleEmailBlur = () => {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     if (!emailRegex.test(vendorData.email)) {
//       setEmailError('Please enter a valid email address.');
//     } else {
//       setEmailError('');
//     }
//   };
//   const handleCancel = (e) => {
//     e.preventDefault();
//     navigate(-1);
//   };

//   return (
//     // <div className="container">
//     <div className='bg-white rounded-2xl p-6 shadow-md '>
//       <h1 className="text-[#959595] mb-[15px] font-bold text-2xl">Add Vendor</h1>
//       <form onSubmit={handleSubmit} >
//         <div className='flex flex-col overflow-y-auto h-[calc(100vh-240px)]'>
//           <div className="flex flex-wrap gap-[10px] mb-[10px] w-full px-2">
//             <div className="flex-1 min-w-[1px]">
//               <label htmlFor="name" className="block font-bold mb-[5px]">Name <span className='text-red-600'>*</span></label>
//               <CustomInput
//                 id="name"
//                 name="name"
//                 value={vendorData.name}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full"
//               />
//             </div>
//             <div className="flex-1 min-w-[1px]">
//               <label htmlFor="phone" className="block font-bold mb-[5px]">Phone <span className='text-red-600'>*</span></label>
//               <CustomInput
//                 id="phone"
//                 name="phone"
//                 type='tel'
//                 value={vendorData.phone}
//                 onChange={handlePhoneChange}
//                 required
//                 className="w-full"
//               />
//             </div>
//           </div>
//           <div className="flex mb-[15px] w-full px-2 gap-3">
//             <div className="w-full items-center py-2">
//               <label htmlFor="email" className="w-40 block font-bold mb-[5px]">Email <span className='text-red-600'>*</span></label>
//               <CustomInput
//                 id="email"
//                 name="email"
//                 type='email'
//                 value={vendorData.email}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full"
//               />
//               {emailError && (
//                 <span className="text-red-600 text-sm">{emailError}</span>
//               )}
//             </div>

//             <div className="w-full items-center py-2">
//               <p className="block font-bold mb-[5px]">Attatch Vendor W9 </p>
//               <div className='flex'>
//                 <div className="relative inline-block border border-gray-light rounded-md p-1 ">
//                   <input
//                     type="file"
//                     onChange={handleImageChange}
//                     // multiple
//                     accept="image/*"
//                     className="absolute inset-0 opacity-0 py-1"
//                     required
//                   />
//                   <span className="text-gray-dark">Choose File <span className='text-red-600'>*</span></span>
//                 </div>
//                 <span className="text-gray-dark ml-2 flex items-center">
//                   {attachedFile?.length > 0 ? attachedFile?.map(file => file.name).join(', ') : 'No file selected'}
//                   {attachedFile?.length > 0 &&
//                     <CrossButton className='w-8 h-8' onClick={() => handleRemoveImage()} />
//                   }
//                 </span>
//               </div>
//             </div>

//           </div>

//           <h2 className="text-[#959595] mb-[15px] font-bold text-lg px-2">Address</h2>
//           <div className="flex flex-wrap gap-[10px] mb-[15px] w-full px-2">
//             <div className="flex-1 min-w-[1px]">
//               <label htmlFor="street1" className="block font-bold mb-[5px]">
//                 Street Line 1 <span className='text-red-600'>*</span>
//               </label>
//               <CustomInput
//                 id="street1"
//                 name="address.street1"
//                 value={vendorData.address.street1}
//                 onChange={handleInputChange}
//                 className="w-full"
//                 required
//               />
//             </div>

//             <div className="flex-1 min-w-[1px]">
//               <label htmlFor="street2" className="block font-bold mb-[5px]">
//                 Street Line 2
//               </label>
//               <CustomInput
//                 id="street2"
//                 name="address.street2"
//                 value={vendorData.address.street2}
//                 onChange={handleInputChange}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-[10px] mb-[15px] w-full px-2">
//             <div className="flex-1 min-w-[1px]">
//               <label htmlFor="city" className="block font-bold mb-[5px]">
//                 City <span className='text-red-600'>*</span>
//               </label>
//               <CustomInput
//                 id="city"
//                 name="address.city"
//                 value={vendorData.address.city}
//                 onChange={handleInputChange}
//                 className="w-full"
//                 required
//               />
//             </div>

//             <div className="flex-1 min-w-[1px]">
//               <label htmlFor="state" className="block font-bold mb-[5px]">
//                 State <span className='text-red-600'>*</span>
//               </label>
//               <CustomInput
//                 id="state"
//                 name="address.state"
//                 value={vendorData.address.state}
//                 onChange={handleInputChange}
//                 className="w-full"
//                 required
//               />
//             </div>

//             <div className="flex-1 min-w-[1px]">
//               <label htmlFor="zipcode" className="block font-bold mb-[5px]">
//                 Zip code <span className='text-red-600'>*</span>
//               </label>
//               <CustomInput
//                 id="zipcode"
//                 name="address.zipcode"
//                 value={vendorData.address.zipcode}
//                 onChange={handleInputChange}
//                 type='number'
//                 className="w-full"
//                 required
//               />
//             </div>

//             {/* <div className="flex-1 min-w-[1px]">
//               <label htmlFor="country" className="block font-bold mb-[5px]">
//                 Country <span className='text-red-600'>*</span>
//               </label>
//               <CustomInput
//                 id="country"
//                 name="address.country"
//                 value={vendorData.address.country}
//                 onChange={handleInputChange}
//                 className="w-full"
//                 required
//               />
//             </div> */}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-center gap-2">
//           <ButtonWithIcon
//             type="buttom"
//             onClick={handleCancel}
//             text="Discard"
//             className="bg-red-600 text-white px-3 py-2 rounded-full min-w-[100px]"
//           />
//           <ButtonWithIcon
//             type="submit"
//             text="Save"
//             className="bg-blue text-white px-3 py-2 rounded-full min-w-[100px]"
//           />
//         </div>
//       </form>
//     </div>
//     // </div>
//   );
// };

// export default AddVendor;
