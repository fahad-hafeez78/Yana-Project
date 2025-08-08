// import { useEffect, useState } from "react";
// import Table from "../../../elements/table/Table";
// import { useDispatch } from "react-redux";
// import ordersAssignmentMiddleware from "../../../redux/middleware/ridersTracking/ordersAssignmentMiddleware";
// import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
// import MapModel from "./MapModel";
// import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
// import zonesMiddleware from "../../../redux/middleware/ridersTracking/zonesMiddleware";
// import AssignZoneModel from "./AssignZoneModel";
// import { showErrorAlert } from "../../../redux/actions/alertActions";

// export default function OrderAssignment() {
//     const dispatch = useDispatch();

//     const [unAssignedOrders, setUnAssignedOrders] = useState([]);
//     const [allZones, setAllZones] = useState([]);

//     const [isLoading, setIsLoading] = useState(true);
//     const [isMapModelOpen, setIsMapModelOpen] = useState(false);
//     const [isAssignZoneModelOpen, setIsAssignZoneModelOpen] = useState(false);

//     const [mapCoordinates, setMapCoordinates] = useState();
//     const [selectedOrderDetail, setSelectedOrderDetail] = useState({
//         _id: '',
//         order_id: '',
//         zoneId: null,
//         zoneName: ''
//     });

//     const columns = [
//         { key: 'order_id', header: 'Order Id' },
//         { key: 'customer.name', header: 'Name' },
//         {
//             key: 'address',
//             header: 'Address',
//             accessor: (row) => {
//                 const addressParts = [
//                     row?.delivery_location?.street1 || "",
//                     row?.delivery_location?.street2 || "",
//                     row?.delivery_location?.city || "",
//                     row?.delivery_location?.state || "",
//                     row?.delivery_location?.zip || "",
//                 ];
//                 return addressParts.filter(value => value).join(" -- ");
//             },
//         },
//         {
//             key: 'zone',
//             header: 'Zone',
//             accessor: (row) => (
//                 <div className="py-3 pr-5 flex items-center ">
//                     <CustomDropdown
//                         id="zone"
//                         name="zone"
//                         value={row?.zone}
//                         onChange={(e) => handleInputChange(row?._id, row?.order_id, e.target.value)}
//                         options={allZones}
//                     />
//                 </div>
//             ),
//         },
//         {
//             key: 'map',
//             header: 'Map',
//             accessor: (row) => (
//                 <div className="py-1">
//                     <ButtonWithIcon text="Map" type="button" className="bg-red px-2 text-white rounded-lg" onClick={() => { setMapCoordinates(row?.delivery_location?.coordinates?.coordinates), setIsMapModelOpen(true) }} />
//                 </div>
//             ),
//         },
//     ];

//     useEffect(() => {
//         fetchZones();
//         fetchUnAssignedOrders();
//     }, []);

//     const fetchUnAssignedOrders = async () => {
//         try {
//             const response = await dispatch(ordersAssignmentMiddleware.GetUnAssignedOrders());
//             if (response?.success) {
//                 setUnAssignedOrders(response?.orders);
//             }
//         } catch (error) {

//         }
//         finally {
//             setIsLoading(false);
//         }
//     }

//     const fetchZones = async () => {
//         try {
//             const response = await dispatch(zonesMiddleware.GetAllZones());
//             if (response?.success) {
//                 const options = response?.zones?.map(zone => ({
//                     value: zone._id,
//                     label: zone.name,
//                 }));
//                 setAllZones([{ value: '', label: "Select" }, ...options]);
//             }
//         } catch (error) {
//             console.log(error)
//         }
//     }

//     const handleInputChange = (orderId, order_id, zoneId) => {
//         if (!zoneId) {
//             setSelectedOrderDetail([]);
//             return;
//         }

//         const zone = allZones?.find((zone) => zone?.value === zoneId);
//         if (zone) {
//             setSelectedOrderDetail(prev => ({ ...prev, zoneName: zone?.label, _id: orderId, order_id: order_id, zoneId: zone?.value }))
//             setIsAssignZoneModelOpen(true);
//         }
//     }

//     const handleCancelAssignment = () => {
//         setIsAssignZoneModelOpen(false);
//     }

//     const handleConfirmAssignment = async () => {

//         const body = {
//             "orderId": selectedOrderDetail?._id,
//             "zoneId": selectedOrderDetail?.zoneId
//         }

//         try {
//             const response = await dispatch(ordersAssignmentMiddleware.AssignedZoneToOrder(body));
//             if (response?.success) {
//                 fetchUnAssignedOrders();
//             }
//         } catch (error) {

//         } finally {
//             setIsAssignZoneModelOpen(false);
//         }
//     }

//     return (
//         <>
//             <div className="grid gap-5">
//                 <Table
//                     tableTitle="Order Assignment"
//                     columns={columns}
//                     rows={unAssignedOrders}
//                     isLoading={isLoading}
//                     tableHeight="h-[calc(100vh-180px)]"
//                 />
//             </div>

//             {isMapModelOpen && <MapModel coordinates={mapCoordinates} onCancel={() => setIsMapModelOpen(false)} />}
//             {isAssignZoneModelOpen && <AssignZoneModel selectedOrderDetail={selectedOrderDetail} onConfirm={handleConfirmAssignment} onCancel={handleCancelAssignment} />}
//         </>
//     );
// }
