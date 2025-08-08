import IconActiveUsers from "../../assets/customIcons/dashBoardIcons/IconActiveParticipants.svg";
import IconActiveOrders from "../../assets/customIcons/dashBoardIcons/IconActiveOrders.svg";
import IconPendingOrders from "../../assets/customIcons/dashBoardIcons/IconPendingOrders.svg";
import IconNewCustomers from "../../assets/customIcons/dashBoardIcons/IconNewParticipants.svg";

export default function DashboardCards({ totalActiveOrders, totalsPendingOrders, totalActiveCustomers }) {
    const statCards = [
        {
            label: "Active Orders",
            value: `${totalActiveOrders}`,
            icon: IconActiveOrders,
        },
        {
            label: "Pending Orders",
            value: `${totalsPendingOrders}`,
            icon: IconPendingOrders,
        },

        {
            label: "Active Participants",
            value: `${totalActiveCustomers}`,
            icon: IconActiveUsers,
        },
        {
            label: "New Participants",
            value: `${totalActiveCustomers}`,
            icon: IconNewCustomers,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {statCards.map((card, index) => (
                <div
                    key={index}
                    className="bg-white p-3 rounded-lg shadow-md flex gap-2 items-center"
                >
                    <img
                        src={card.icon}
                        alt={`${card.label} icon`}
                        className="w-12 h-12"
                    />
                    <div>
                        <h3 className="text-2xl font-bold">{card.value}</h3>
                        <p className="text-gray text-sm">{card.label}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}