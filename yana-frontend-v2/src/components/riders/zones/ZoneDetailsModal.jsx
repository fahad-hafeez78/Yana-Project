// import CrossButton from "../../../elements/crossButton/CrossButton";
// import CustomInput from "../../../elements/customInput/CustomInput";
// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import zonesMiddleware from "../../../redux/middleware/ridersTracking/zonesMiddleware";
// import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";

// export default function ZoneDetailsModal({ onSuccess, zoneDetails, setisEditZoneModalOpen }) {

//     const dispatch = useDispatch();
//     const [newZone, setNewZone] = useState({
//         name: zoneDetails?.name,
//     });

//     const handleUpdateZone = async (e) => {
//         e.preventDefault();
        
//         try {
//             const response = await dispatch(zonesMiddleware.UpdateZone(zoneDetails?._id, newZone))
//             if (response?.success) {
//                 onSuccess();
//                 setisEditZoneModalOpen(false);
//             }
//         } catch (error) {

//         }
//     }

//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
//             <div className="flex flex-col gap-2 bg-white rounded-xl shadow-lg p-6 relative">
//                 <CrossButton
//                     onClick={() => setisEditZoneModalOpen(false)}
//                     className="absolute top-4 right-3 text-gray hover:text-gray-dark"
//                 />
//                 <h2 className="text-2xl text-gray text-center font-bold">
//                     Edit Zone
//                 </h2>

//                 <form onSubmit={handleUpdateZone} className="flex flex-col gap-2">
//                     <div className="flex flex-col gap-2">
//                         <div className="flex gap-1">
//                             <CustomInput
//                                 id="zoneName"
//                                 placeholder="Zone Name"
//                                 className="w-full"
//                                 required={true}
//                                 value={newZone?.name}
//                                 onChange={(e) => setNewZone((prev) => ({ ...prev, name: e.target.value }))}
//                             />
//                         </div>
//                     </div>

//                     <div className="flex justify-center space-x-2">
//                         <ButtonWithIcon
//                             type="button"
//                             text="Discard"
//                             onClick={() => setisEditZoneModalOpen(false)}
//                             className="font-medium px-4 py-2 bg-gray-200 rounded-full text-gray-800 hover:bg-gray-light"
//                         />

//                         <ButtonWithIcon
//                             type="submit"
//                             text="Confirm"
//                             className="font-medium px-4 py-2 bg-blue text-white rounded-full"
//                         />
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }
