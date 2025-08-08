import CrossButton from "../../../elements/crossButton/CrossButton";
import CustomInput from "../../../elements/customInput/CustomInput";
import RiderDetailsOrderStatus from "./RiderDetailsOrderStatus";

export default function RiderDetailsModal({ onCancel }) {

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="flex flex-col gap-2 bg-white rounded-xl shadow-lg p-6 relative">

                <CrossButton onClick={onCancel} className="absolute top-4 right-3 text-gray hover:text-gray-dark" />
                <h2 className="text-2xl text-gray text-center font-bold">Rider Details</h2>

                <div className="flex gap-2 w-full">
                    <div className="w-full">
                        <label className="block font-semibold ">Name</label>
                        <CustomInput
                            id="riderName"
                            placeholder="Rider Name"
                            value="John"
                            className="w-full"
                            readOnly
                        />
                    </div>
                    <div className="w-full">
                        <label className="block font-semibold ">No of Orders</label>
                        <CustomInput
                            id="numberOfOrders"
                            placeholder="Number Of Orders"
                            value="2"
                            className="w-full"
                            readOnly
                        />
                    </div>
                </div>

                <span className="text-lg font-semibold ">Orders</span>

                <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto ">
                    <RiderDetailsOrderStatus />
                    <RiderDetailsOrderStatus />
                </div>

                <div className="flex justify-center space-x-2">
                    <button
                        className="font-medium px-4 py-2 bg-gray-200 rounded-full text-gray-800 hover:bg-gray-light"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    {/* <button className="font-medium px-4 py-2 bg-blue text-white rounded-full">
                    Save
                </button> */}
                </div>

            </div>
        </div>
    )
}
