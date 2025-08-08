import { useJsApiLoader, GoogleMap, OverlayView, DirectionsRenderer, Marker } from "@react-google-maps/api";
import Spinner from "../../../elements/customSpinner/Spinner";
import DriverCarMarkerIcon from "../../../assets/customIcons/ridersTrackingIcons/DriverCarMarkerIcon.svg";
import { useState, useRef, useEffect } from "react";
import RiderDetailsModal from "./RiderDetailsModal";
import { useDispatch } from "react-redux";
import { showErrorAlert } from "../../../redux/actions/alertActions";

const TrackRiders = () => {
    const dispatch = useDispatch();
    const currentGeoLocation = useRef(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [isRiderDetailsModalOpen, setIsRiderDetailsModalOpen] = useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
        libraries: ['places']
    });

    useEffect(() => {
        if (isLoaded) {
            getUserLocation();
        }
    }, [isLoaded]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    currentGeoLocation.current = { lat: latitude, lng: longitude };

                    if (currentGeoLocation.current) getRoutes();

                },
                (error) => {
                    dispatch(showErrorAlert(error?.message || "Unable to fetch location."));
                }
            );
        } else {
            dispatch(showErrorAlert("Geolocation is not supported by this browser."));
        }
    };

    const getRoutes = async () => {
        try {
            const directionsService = new google.maps.DirectionsService();
            const deliveryStops = [
                { lat: 33.590391, lng: 73.029155 },
                { lat: 33.591892, lng: 73.027410 },
                { lat: 33.593000, lng: 73.026000 },
            ];
            const result = await directionsService.route({
                origin: currentGeoLocation.current,
                destination: deliveryStops[deliveryStops.length - 1],
                waypoints: deliveryStops.slice(0, -1).map((stop) => ({ location: stop })),
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING,
            });
            setDirectionsResponse(result);
        } catch (error) {
            dispatch(showErrorAlert("Failed to fetch directions."));
        }
    };

    const openRiderDetailsModal = () => setIsRiderDetailsModalOpen(true);
    const closeRiderDetailsModal = () => setIsRiderDetailsModalOpen(false);

    if (!isLoaded) {
        return <Spinner />;
    }

    const deliveryStops = [
        { lat: 33.590391, lng: 73.029155 },
        { lat: 33.591892, lng: 73.027410 },
        { lat: 33.593000, lng: 73.026000 },
    ];

    return (
        <>
            <GoogleMap
                center={currentGeoLocation.current}
                zoom={15}
                mapContainerStyle={{ height: "calc(100vh - 100px)", borderRadius: "16px" }}
            >
                {/* <Marker
                    position={deliveryStops[0]}
                    icon={{
                        url: DriverCarMarkerIcon, // Use the URL of the SVG icon
                        scaledSize: new google.maps.Size(40, 40), // Adjust the size as needed
                    }}
                /> */}
                <OverlayView
                    position={currentGeoLocation.current}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                    <div className="relative flex flex-col items-center gap-4">
                        <div>
                            <div className="flex bg-[#0E6D99] rounded-md p-2 gap-4 items-center">
                                <span className="text-sm text-white whitespace-nowrap">start point </span>
                                <button
                                    className="bg-secondary-dark text-white p-1 rounded-sm"
                                    onClick={openRiderDetailsModal}
                                >
                                    Offline
                                </button>
                            </div>
                            <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-[18px] border-l-[18px] border-r-[18px] border-t-[#0E6D99] border-l-transparent border-r-transparent" />
                        </div>
                        <img src={DriverCarMarkerIcon} alt="Driver Icon" />
                    </div>
                </OverlayView>
                {directionsResponse && (
                    <DirectionsRenderer
                        directions={directionsResponse}
                        options={{
                            polylineOptions: {
                                strokeColor: "#FF0000",
                                strokeOpacity: 0.8,
                                strokeWeight: 4,
                            },
                            suppressMarkers: true,
                        }}
                    />
                )}
                {deliveryStops.map((stop, index) => (
                    <OverlayView
                        key={index}
                        position={stop}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <div className="relative flex flex-col items-center gap-4">
                            <div>
                                <div className="flex bg-[#0E6D99] rounded-md p-2 gap-4 items-center">
                                    <span className="text-sm text-white whitespace-nowrap">Stop {index + 1}</span>
                                    <button
                                        className="bg-secondary-dark text-white p-1 rounded-sm"
                                        onClick={openRiderDetailsModal}
                                    >
                                        Offline
                                    </button>
                                </div>
                                <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-[18px] border-l-[18px] border-r-[18px] border-t-[#0E6D99] border-l-transparent border-r-transparent" />
                            </div>
                            <img src={DriverCarMarkerIcon} alt="Driver Icon" />
                        </div>
                    </OverlayView>
                ))}
            </GoogleMap>

            {isRiderDetailsModalOpen && <RiderDetailsModal onCancel={closeRiderDetailsModal} />}
        </>
    );
};

export default TrackRiders;
