import { useDispatch } from "react-redux";
import CrossButton from "../../../elements/crossButton/CrossButton";
import zonesMiddleware from "../../../redux/middleware/ridersTracking/zonesMiddleware";
import ridersMiddleware from "../../../redux/middleware/ridersTracking/ridersMiddleware";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";

export default function DeleteRiderModal({ riderDetails, onCancel, fetchRiders }) {

    const dispatch = useDispatch();

    const handleDeleteRider = async (e) => {
        e.preventDefault();

        try {
            const response = await dispatch(ridersMiddleware.DeleteRider(riderDetails?._id));
            if (response?.success) {
                fetchRiders();
                onCancel();
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">

                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-gray hover:text-gray-dark"
                    onClick={onCancel}
                >
                    <CrossButton />
                </button>

                <h2 className="text-2xl text-gray text-center font-bold mb-4">
                    Delete Rider
                </h2>

                {riderDetails?.photo &&
                    <div className="flex justify-center">
                        <img
                            src={riderDetails?.photo}
                            alt={riderDetails?.name}
                            className="w-20 h-20 shadow-lg rounded-full mb-1"
                        />
                    </div>}
                <h1 className="text-xl font-bold text-center text-gray-600 mb-2">
                    {riderDetails?.name}
                </h1>
                <h3 className="text-gray-400 text-center text-lg font-medium mb-4">
                    Are you sure you want to delete this rider?
                </h3>
                <div className="flex justify-center space-x-4">
                    <ButtonWithIcon
                        text="Cancel"
                        variant="discard"
                        onClick={onCancel}
                    />

                    <ButtonWithIcon
                        text="Delete"
                        variant="confirm"
                        onClick={handleDeleteRider}
                    />
                </div>
            </div>
        </div >
    );
}
