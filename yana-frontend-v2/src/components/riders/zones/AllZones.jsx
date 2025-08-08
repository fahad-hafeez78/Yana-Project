// import { useEffect, useState } from "react";
// import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
// import Table from "../../../elements/table/Table";
// import CreateZoneModal from "./CreateZoneModal"
// import AddZoneIcon from "../../../assets/customIcons/ridersTrackingIcons/AddZoneIcon.svg";
// import zonesMiddleware from "../../../redux/middleware/ridersTracking/zonesMiddleware";
// import { useDispatch } from "react-redux";
// import edit from "../../../assets/customIcons/generalIcons/edit.svg"
// import TrashIcon from "../../../assets/customIcons/generalIcons/trash.svg";
// import ZoneDetailsModal from "./ZoneDetailsModal";
// import DeleteZoneModal from "./DeleteZoneModal";

// export default function AllZones() {
//     const columns = [
//         { key: 'name', header: 'Name' },
//         {
//             key: 'actions', header: 'Actions', accessor: (row) => (
//                 <div className="flex gap-2">

//                     <button onClick={() => { setZoneDetails(row), setisEditZoneModalOpen(true) }}>
//                         <img src={edit} alt="View" width={20} height={20} />
//                     </button>
//                     <button onClick={() => { setZoneDetails(row), setIsDeleteModalOpen(true) }}>
//                         <img src={TrashIcon} alt="View" width={16} height={16} />
//                     </button>
//                 </div>
//             )
//         },

//     ];

//     const dispatch = useDispatch();

//     const [isLoading, setisLoading] = useState(true);
//     const [isCreateZoneModalOpen, setisCreateZoneModalOpen] = useState(false);
//     const [isEditZoneModalOpen, setisEditZoneModalOpen] = useState(false);
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

//     const [zoneDetails, setZoneDetails] = useState([]);
//     const [allZones, setAllZones] = useState([]);


//     useEffect(() => {
//         fetchZones();
//     }, []);

//     const fetchZones = async () => {
//         try {
//             const response = await dispatch(zonesMiddleware.GetAllZones());
//             if (response?.success) {
//                 setAllZones(response.zones);
//             }
//         } catch (error) {
//             console.log(error)
//         } finally {
//             setisLoading(false)
//         }
//     }

//     return (
//         <div className="grid gap-5">

//             <div className="flex gap-3 justify-end items-center">
//                 <ButtonWithIcon
//                     onClick={() => setisCreateZoneModalOpen(true)}
//                     icon={<img src={AddZoneIcon} alt="import file" width={18} height={18} />}
//                     text="Create New Zone"
//                     className="bg-blue text-white px-3 py-2 rounded-full"
//                 />
//             </div>

//             <Table
//                 tableTitle="Zones"
//                 columns={columns}
//                 rows={allZones}
//                 isLoading={isLoading}
//                 tableHeight="h-[calc(100vh-250px)]"
//             />

//             {isCreateZoneModalOpen && <CreateZoneModal onCancel={() => setisCreateZoneModalOpen(false)} onSuccess={fetchZones} />}
//             {isEditZoneModalOpen && <ZoneDetailsModal zoneDetails={zoneDetails} setisEditZoneModalOpen={setisEditZoneModalOpen} onSuccess={fetchZones}/>}
//             {isDeleteModalOpen && <DeleteZoneModal zoneDetails={zoneDetails} onCancel={() => setIsDeleteModalOpen(false)} onSuccess={fetchZones}/>}

//         </div>
//     );
// }