import { AdvancedMarker, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { offSocketEvent, onSocketEvent } from '../../config/webSocket';
import { DashBoardIcon } from "../../assets/customIcons/sidebarIcons/SidebarIcons.jsx";
import DriverCarMarkerIcon from "../../assets/customIcons/ridersTrackingIcons/DriverCarMarkerIcon.svg";
import capitalizeFirstLetter from '../../util/capitalizeFirstLetter/CapitalizeFirstLetter.js';
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import Spinner from '../../elements/customSpinner/Spinner.jsx';

export default function RouteDirectionsMap({ routeDetail }) {
    const [riderLocation, setRiderLocation] = useState(null);
    const [combinedDirections, setCombinedDirections] = useState(null);
    const [loading, setLoading] = useState(true);

    const deliveryStops = routeDetail?.stops?.map(stop => ({
        lat: stop.location[1],
        lng: stop.location[0]
    })) || [];

    const coreLibrary = useMapsLibrary('core');
    const routesLibrary = useMapsLibrary('routes');
    const geometryLibrary = useMapsLibrary('geometry');
    const [directionsService, setDirectionsService] = useState();
    const [directionsRenderer, setDirectionsRenderer] = useState();
    const map = useMap();

    useEffect(() => {
        if (!routesLibrary) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 6,
            }
        }));
    }, [routesLibrary, map]);

    useEffect(() => {
        onSocketEvent('riderLiveLocation', (riderLocationDetail) => {
            setRiderLocation(riderLocationDetail);
        });

        return () => {
            offSocketEvent('riderLiveLocation', {});
        };
    }, []);

    useEffect(() => {
        if (!directionsService || !deliveryStops.length) return;

        // setLoading(true);
        const MAX_WAYPOINTS = 23; // Google's limit is 25 total (origin + 23 waypoints + destination)
        const waypointChunks = [];
        
        // Split waypoints into chunks of MAX_WAYPOINTS
        for (let i = 0; i < deliveryStops.length; i += MAX_WAYPOINTS) {
            waypointChunks.push(deliveryStops.slice(i, i + MAX_WAYPOINTS));
        }

        const processRouteChunk = async (chunkIndex, previousEndPoint = null) => {
            const isFirstChunk = chunkIndex === 0;
            const isLastChunk = chunkIndex === waypointChunks.length - 1;
            const chunk = waypointChunks[chunkIndex];

            try {
                const response = await directionsService.route({
                    origin: isFirstChunk ? routeDetail?.kitchenCordinates : previousEndPoint,
                    destination: isLastChunk ? deliveryStops[deliveryStops.length - 1] : chunk[chunk.length - 1],
                    waypoints: isFirstChunk 
                        ? chunk.slice(0, isLastChunk ? -1 : chunk.length).map(location => ({ location, stopover: true }))
                        : chunk.slice(0, isLastChunk ? -1 : chunk.length).map(location => ({ location, stopover: true })),
                    travelMode: google.maps.TravelMode.DRIVING,
                });

                const endPoint = isLastChunk 
                    ? deliveryStops[deliveryStops.length - 1]
                    : chunk[chunk.length - 1];

                return {
                    response,
                    endPoint,
                    isLastChunk
                };
            } catch (error) {
                console.error(`Error processing chunk ${chunkIndex}:`, error);
                throw error;
            }
        };

        const processAllChunksSequentially = async () => {
            let combinedPath = [];
            let combinedLegs = [];
            let previousEndPoint = null;
            let firstResponse = null;

            for (let i = 0; i < waypointChunks.length; i++) {
                try {
                    const { response, endPoint, isLastChunk } = await processRouteChunk(i, previousEndPoint);
                    
                    if (i === 0) firstResponse = response;
                    
                    // Get the path for this segment
                    const segmentPath = response.routes[0].overview_path || 
                                      decodePolyline(response.routes[0].overview_polyline);
                    
                    // Combine paths
                    if (i > 0 && combinedPath.length > 0) {
                        // Find the closest point between the end of previous path and start of new path
                        const connectionPoint = findNearestPointOnPath(
                            new google.maps.LatLng(segmentPath[0]),
                            combinedPath
                        );
                        
                        // Add the connecting segment to make the path continuous
                        combinedPath.push({
                            lat: connectionPoint.lat(),
                            lng: connectionPoint.lng()
                        });
                    }
                    
                    combinedPath = [...combinedPath, ...segmentPath];
                    combinedLegs = [...combinedLegs, ...response.routes[0].legs];
                    previousEndPoint = endPoint;

                    if (isLastChunk) {
                        // Create synthetic directions response
                        const syntheticDirections = {
                            ...firstResponse,
                            routes: [{
                                ...firstResponse.routes[0],
                                overview_path: combinedPath,
                                legs: combinedLegs
                            }]
                        };

                        setCombinedDirections(syntheticDirections);
                        
                        if (directionsRenderer) {
                            directionsRenderer.setDirections(syntheticDirections);
                        }
                        
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Error in route processing:', error);
                    // setLoading(false);
                    break;
                }
            }
        };

        processAllChunksSequentially();

    }, [directionsService]);

    useEffect(() => {
        if (!combinedDirections || !routeDetail?.stops || !coreLibrary || !map) return;

        const routePath = combinedDirections.routes[0].overview_path ||
            decodePolyline(combinedDirections.routes[0].overview_polyline);

        // Create new polylines
        const newPolylines = routeDetail?.stops.map(stop => {
            const stopPosition = new google.maps.LatLng(stop.location[1], stop.location[0]);
            const nearestPoint = findNearestPointOnPath(stopPosition, routePath);

            return new google.maps.Polyline({
                path: [stopPosition, nearestPoint],
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                strokeDashArray: [5, 5],
                zIndex: 10,
                map: map
            });
        });

        return () => {
            newPolylines.forEach(polyline => {
                if (polyline && polyline.setMap) {
                    polyline.setMap(null);
                }
            });
        };
    }, [combinedDirections, routeDetail?.stops, coreLibrary, map]);

    // Helper functions
    const decodePolyline = (encoded) => {
        if (!encoded || !geometryLibrary) return [];
        return geometryLibrary.encoding.decodePath(encoded).map(p => ({
            lat: p.lat(),
            lng: p.lng()
        }));
    };

    const findNearestPointOnPath = (point, path) => {
        if (!path || path.length === 0 || !geometryLibrary) return point;

        let nearest = path[0];
        let minDist = Number.MAX_VALUE;

        path.forEach(pathPoint => {
            const dist = geometryLibrary.spherical.computeDistanceBetween(
                point,
                new google.maps.LatLng(pathPoint)
            );
            if (dist < minDist) {
                minDist = dist;
                nearest = pathPoint;
            }
        });

        return nearest;
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

    if (loading) {
        return <div className="flex justify-center items-center bg-white h-full"><Spinner /></div>;
    }

    if (!combinedDirections) return null;

    return (
        <Map
            defaultCenter={routeDetail?.kitchenCordinates}
            defaultZoom={9}
            mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        >
            {/* Rider Current location */}
            {riderLocation?.location &&
                <AdvancedMarker position={{ lat: riderLocation.location[0], lng: riderLocation.location[1] }}>
                    <ButtonWithIcon
                        icon={<img src={DriverCarMarkerIcon} alt="Driver Icon" className="w-8 h-8" />}
                    />
                </AdvancedMarker>
            }

            {/* Vendor Kitchen Address */}
            <AdvancedMarker position={routeDetail?.kitchenCordinates}>
                <div className="bg-primary p-2 rounded-full">
                    <DashBoardIcon isActive={true} />
                </div>
            </AdvancedMarker>

            {routeDetail?.stops?.map((stop, originalIndex) => {
                return (
                    <AdvancedMarker
                        key={originalIndex}
                        position={{ lat: stop.location[1], lng: stop.location[0] }}
                        title={`Stop ${stop?.sequence}`}
                    >
                        <div className="relative group">
                            <div className={`${stop?.nextDestination ? 'bg-[#FFA500]' : stop?.status === 'delivered' ? 'bg-[#00A326]' : stop?.status === 'canceled' ? 'bg-[#D61125]' : 'bg-blue'} px-3 py-2 rounded-full`}>
                                <span className="text-white font-bold">{stop?.sequence}</span>
                                <div className={`absolute -bottom-[10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-t-[16px] ${stop?.nextDestination ? 'border-t-[#FFA500]' : stop?.status === 'delivered' ? 'border-t-[#00A326]' : stop?.status === 'canceled' ? 'border-t-[#D61125]' : 'border-t-blue'} border-r-[12px] border-r-transparent`} />
                            </div>

                            <div className="absolute hidden group-hover:block z-50 min-w-[200px] max-w-[300px] bg-white shadow-lg rounded-md p-2 mt-4 left-1/2 transform -translate-x-1/2">
                                <div className="text-sm font-medium text-gray-800">
                                    {formatAddress(stop?.order?.delivery_location)}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-gray mt-1">
                                        Stop {stop?.sequence} of {deliveryStops.length}
                                    </div>
                                    <div className="text-xs text-gray font-semibold mt-1">
                                        Status: <span className={`${stop?.nextDestination ? 'text-[#FFA500]' : stop?.status === 'delivered' ? 'text-[#00A326]' : stop?.status === 'canceled' ? 'text-[#D61125]' : 'text-blue'}`}>{capitalizeFirstLetter(stop?.status)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AdvancedMarker>
                );
            })}
        </Map>
    )
}