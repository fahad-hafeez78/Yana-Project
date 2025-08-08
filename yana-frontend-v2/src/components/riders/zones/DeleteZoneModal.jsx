// import { useDispatch } from "react-redux";
// import CrossButton from "../../../elements/crossButton/CrossButton";
// import zonesMiddleware from "../../../redux/middleware/ridersTracking/zonesMiddleware";

// export default function DeleteZoneModal({ onSuccess, zoneDetails, onCancel }) {
    
//     const dispatch = useDispatch();

//     const handleDeleteZone = async (e) => {
//         e.preventDefault();

//         try {
//             const response = await dispatch(zonesMiddleware.DeleteZone(zoneDetails?._id));
//             if (response?.success) {
//                 onSuccess();
//                 onCancel();
//             }
//         } catch (error) {
//             console.log(error)
//         }
//     }
//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
//             <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">

//                 {/* Close Button */}
//                 <button
//                     className="absolute top-3 right-3 text-gray hover:text-gray-dark"
//                     onClick={onCancel}
//                 >
//                     <CrossButton />
//                 </button>

//                 <h2 className="text-2xl text-gray text-center font-bold mb-4">
//                     Delete Zone
//                 </h2>
//                 {/* <div className="flex justify-center">
//           <img
//             src={menu.imgPath}
//             alt={menu.name}
//             className="w-20 h-20 shadow-lg rounded-full mb-1"
//           />
//         </div> */}
//                 <h1 className="text-xl font-bold text-center text-gray-600 mb-2">
//                     {zoneDetails?.name}
//                 </h1>
//                 <h3 className="text-gray-400 text-center text-lg font-medium mb-4">
//                     Are you sure you want to delete this zone?
//                 </h3>
//                 <div className="flex justify-center space-x-4">
//                     <button
//                         className="font-medium px-4 py-2 bg-gray-200 rounded-full text-gray-800 hover:bg-gray-light"
//                         onClick={onCancel}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         className="font-medium px-4 py-2 bg-blue text-white rounded-full"
//                         onClick={handleDeleteZone}
//                     >
//                         Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
