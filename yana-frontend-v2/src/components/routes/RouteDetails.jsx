import ArrowBackIcon from "../../assets/customIcons/generalIcons/back.svg"
import { APIProvider } from '@vis.gl/react-google-maps';
import { useLocation, useNavigate } from "react-router-dom";
import { DashBoardIcon } from "../../assets/customIcons/sidebarIcons/SidebarIcons.jsx";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { collapseSidebar, expandSidebar } from "../../redux/reducers/sidebarReducer.js";
import { emitSocketEvent, offSocketEvent, onSocketEvent } from "../../config/webSocket.js";
import routesMiddleware from "../../redux/middleware/ridersTracking/routesMiddleware.js";
import Spinner from "../../elements/customSpinner/Spinner.jsx";
import capitalizeFirstLetter from "../../util/capitalizeFirstLetter/CapitalizeFirstLetter.js";
import RouteDirectionsMap from "./RouteDirectionsMap.jsx";
import ImageModal from "../../elements/imageModal/ImageModal.jsx";

const statusStyles = {
    nextDestination: 'border-2 border-[#FFA500] bg-[#FFEDCC] text-[#FFA500] hover:opacity-80',
    delivered: 'border-2 border-[#00A326] bg-[#CCEDD4] text-[#00A326] hover:opacity-80',
    canceled: 'border-2 border-[#D61125] bg-[#F7CFD3] text-[#D61125] hover:opacity-80',
    default: 'border-2 hover:border-gray hover:bg-gray-100 text-gray-600'
};

export default function RouteDetails() {

    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { routeId } = location.state || {};

    const [isLoading, setIsLoading] = useState(true);

    const [routeDetail, setRouteDetail] = useState({
        routeId: routeId,
        riderId: null,
        riderPhoto: null,
        riderName: null,
        zoneName: null,
        routeStatus: null,
        routeDuration: null,
        routeDistance: null,
        stops: null,
        kitchenCordinates: null,
        kitchenAddress: null
    });

    useEffect(() => {
        const fetchRouteDetails = async () => {
            try {
                const response = await dispatch(routesMiddleware.GetRouteById(routeId));
                if (response?.success) {
                    setRouteDetail({
                        riderId: response?.route?.rider?._id,
                        routeStatus: capitalizeFirstLetter(response?.route?.status),
                        stops: response?.route?.stops,
                        riderPhoto: response?.route?.rider?.photo,
                        zoneName: response?.route?.zone?.name,
                        riderName: response?.route?.rider?.name,
                        routeDuration: response?.route?.directions?.duration,
                        routeDistance: response?.route?.directions?.distance,
                        kitchenCordinates: { lat: response?.route?.vendorId?.kitchen_address?.coordinates?.coordinates[1], lng: response?.route?.vendorId?.kitchen_address?.coordinates?.coordinates[0] },
                        kitchenAddress:
                            [
                                response?.route?.vendorId?.kitchen_address?.street1 || "",
                                response?.route?.vendorId?.kitchen_address?.street2 || "",
                                response?.route?.vendorId?.kitchen_address?.city || "",
                                response?.route?.vendorId?.kitchen_address?.state || "",
                                response?.route?.vendorId?.kitchen_address?.zipcode || "",
                            ]
                                .filter(value => value)
                                .join(" -- ")
                                .trim()

                    })
                }
            } catch (error) {
                console.log("error", error)
            }
            finally {
                setIsLoading(false)
            }
        }
        fetchRouteDetails();
    }, [routeId])

    useEffect(() => {
        dispatch(collapseSidebar());

        return (() => {
            dispatch(expandSidebar());
        });
    }, []);

    useEffect(() => {
        if (routeDetail?.riderId && routeId) {
            emitSocketEvent('subscribeRouteAndRiderTracking', { "routeId": routeId, "riderId": routeDetail?.riderId });

            // Return the cleanup function
            return () => {
                emitSocketEvent('unsubscribeRouteAndRiderTracking', { "routeId": routeId, "riderId": routeDetail?.riderId });
            };
        }
    }, [routeDetail?.riderId]);

    useEffect(() => {
        onSocketEvent('stopsData', (updatedStops) => {
            setRouteDetail(prev => ({ ...prev, stops: updatedStops?.stops }))
        })
        onSocketEvent('routeStatus', (routeStatus) => {
            setRouteDetail(prev => ({ ...prev, routeStatus: capitalizeFirstLetter(routeStatus?.route_status) }))
        })

        return (() => {
            offSocketEvent('stopsData', {})
            dispatch(expandSidebar());
        });
    }, []);

    const getStopStyle = (stop) => {
        if (stop?.nextDestination) return statusStyles.nextDestination;
        if (stop?.status === 'delivered') return statusStyles.delivered;
        if (stop?.status === 'canceled') return statusStyles.canceled;
        return statusStyles.default;
    };

    const formatAddress = (location) => {
        return [
            location?.street1,
            location?.street2,
            location?.city,
            location?.state,
            location?.zip
        ].filter(Boolean).join(', ');
    };

    return (
        isLoading ?
            <div className="h-full bg-white col-span-1 rounded-2xl">
                <Spinner />
            </div>
            :
            <div className="grid h-full grid-cols-4 gap-2 min-h-0">

                <div className="bg-white col-span-1 rounded-2xl flex flex-col min-h-0">
                    <div className="flex justify-between p-2 border-b border-gray-200">
                        <button onClick={() => navigate(-1)}><img src={ArrowBackIcon} alt="Back" className="w-6 h-6" /></button>
                        <div className="flex-1 text-center">
                            <span className="font-bold"> Route Name</span>
                        </div>
                    </div>

                    <div className="flex py-2 border-b border-gray-200">
                        <div className="px-2">
                            <ImageModal imageUrl={routeDetail?.riderPhoto || '/MaleAvatar.png'} className="w-10 h-10 rounded-full" />
                        </div>
                        <div>
                            <span className="font-semibold">{routeDetail?.riderName}</span>
                            <div className="flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-sm">08:00-09:28</span>
                                    <span className="text-sm">{routeDetail?.routeDuration?.hours + 'h' + ' - ' + routeDetail?.routeDuration?.minutes + 'min'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm">{routeDetail?.stops?.length} stops</span>
                                    <span className="text-sm">{routeDetail?.routeDistance} meters</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="flex flex-col flex-grow min-h-0 p-2 py-6">
                        {/* Status and kitchen address */}
                        <div className="flex justify-between items-center">
                            <span className="flex text-sm font-semibold text-blue-600 items-center">{routeDetail?.stops?.length} Jobs</span>
                            <span className="text-sm text-gray-dark font-semibold">
                                Status:
                                <span className={`text-sm font-semibold ${routeDetail?.routeStatus === 'Inprogress' ? 'text-[#00A326]' : ''}`}> {routeDetail?.routeStatus}</span>
                            </span>
                        </div>

                        <div className="flex items-center bg-secondary p-1 mr-2 rounded-md">
                            <DashBoardIcon isActive={true} />
                            <span className="text-sm text-white font-semibold text-gray-600 items-center truncate px-2">{routeDetail?.kitchenAddress}</span>
                        </div>

                        {/* Scrollable stops list */}
                        <div className="flex flex-col flex-grow overflow-y-auto gap-1 mt-2">
                            {routeDetail?.stops?.sort((a, b) => a.sequence - b.sequence)?.map((stop, index) => (
                                <div key={index} className={`mr-0.5 flex gap-2 items-center rounded-md px-1 py-0.5 relative group ${getStopStyle(stop)}`}>
                                    <span className="text-xl font-semibold flex-shrink-0 cursor-default">
                                        {stop?.sequence}
                                    </span>
                                    <span className="text-sm font-semibold truncate cursor-default">
                                        {formatAddress(stop?.order?.delivery_location)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map section */}
                <div className="col-span-3 h-full min-h-0">
                    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_KEY}>
                        <RouteDirectionsMap routeDetail={routeDetail} />
                    </APIProvider>
                </div>
            </div>
    );
}
