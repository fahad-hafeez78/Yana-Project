import CrossButton from "../../../elements/crossButton/CrossButton";
import { GoogleMap, Marker } from "@react-google-maps/api";

export default function MapModel({ coordinates, onCancel }) {

    const center = {
        lng: coordinates[0],
        lat: coordinates[1]
    }
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">

                <CrossButton
                    className="absolute top-3 right-3 text-gray hover:text-gray-dark"
                    onClick={onCancel}
                />

                <h2 className="text-2xl text-gray text-center font-bold mb-4">
                    Order Location
                </h2>
                <GoogleMap
                    center={center}
                    zoom={15}
                    mapContainerStyle={{ height: "calc(50vh)", width: "calc(30vw)", borderRadius: "16px" }}
                >
                    <Marker position={center} />
                </GoogleMap>
                <div className="flex justify-center space-x-4 mt-4">
                    <button
                        className="font-medium px-4 py-2 bg-gray-200 rounded-full text-gray-800 hover:bg-gray-light"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                </div>
            </div>
        </div>
    );
}
