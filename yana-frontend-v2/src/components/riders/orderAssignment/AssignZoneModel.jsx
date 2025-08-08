import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import CrossButton from "../../../elements/crossButton/CrossButton";

export default function AssignZoneModel({ selectedOrderDetail, onConfirm, onCancel }) {

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-100 relative">

                <CrossButton
                    className="absolute top-3 right-3 text-gray hover:text-gray-dark"
                    onClick={onCancel}
                />

                <h2 className="text-2xl text-gray text-center font-bold mb-4">
                    Confirm Assignmnet
                </h2>
                <p className="text-md text-gray text-center font-bold mb-4">
                    Are you sure you want to assign zone:<span className="text-red">{selectedOrderDetail?.zoneName}</span> to order:<span className="text-red">{selectedOrderDetail?.order_id}</span>
                </p>
                <div className="flex justify-center space-x-4 mt-4">
                    <ButtonWithIcon text="Cancel" className="font-medium px-4 py-2 bg-gray-200 rounded-full text-gray-800 hover:bg-gray-light" onClick={onCancel}/>
                    <ButtonWithIcon text="Confirm" className="bg-blue text-white px-3 py-2 rounded-full" onClick={onConfirm}/>
                </div>
            </div>
        </div>
    );
}
