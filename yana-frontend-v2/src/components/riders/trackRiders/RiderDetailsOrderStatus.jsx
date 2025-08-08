
export default function RiderDetailsOrderStatus() {

    return (
        <div className="flex flex-col bg-[#F3F4F6] rounded-md p-2">
            <label className="flex">Order Id: <span className="font-semibold">#12345678</span></label>
            <label className="flex ">Stop Location: <span className="flex font-semibold truncate max-w-[15vw]">22 Sea Breeze</span></label>
            <button className="bg-blue-200 rounded-md p-2"> Completed</button>
        </div>
    )
}
