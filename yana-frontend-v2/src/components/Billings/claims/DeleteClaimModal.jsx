import { useDispatch } from "react-redux";
import CrossButton from "../../../elements/crossButton/CrossButton";
import billingMiddleware from "../../../redux/middleware/billingMiddleware";
import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";

export default function DeleteClaimModal({ claimDetails, onCancel, fetchClaims }) {
    const dispatch = useDispatch();

    const handleDeleteClaim = async (e) => {
        e.preventDefault();

        try {
            const response = await dispatch(billingMiddleware.DeleteClaim(claimDetails?._id));
            if (response?.success) {
                fetchClaims();
                onCancel();
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">

                <CrossButton onClick={onCancel} className="absolute top-3 right-3 text-gray hover:text-gray-dark" />

                <h2 className="text-2xl text-gray-dark text-center font-bold mb-4">
                    Delete Claim
                </h2>

                <h1 className="text-xl font-bold text-center text-gray-600 mb-2">
                    {claimDetails?.claim_num}
                </h1>
                <h3 className="text-gray-400 text-center text-lg font-medium mb-4">
                    Are you sure you want to delete this claim?
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
                        onClick={handleDeleteClaim}
                    />
                </div>
            </div>
        </div >
    );
}
