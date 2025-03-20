import { useDispatch } from "react-redux";
import IconActiveUsers from "../../assets/customIcons/dashBoardIcons/IconActiveCustomers2.png";
import IconActiveOrders from "../../assets/customIcons/dashBoardIcons/IconActiveOrders2.png";
import IconPendingOrders from "../../assets/customIcons/dashBoardIcons/IconPendingOrder2.png";
import IconNewCustomers from "../../assets/customIcons/dashBoardIcons/IconNewCustomers2.png";
import ParticipantsTable from "../../components/dashboard/participantsTable/ParticipantsTable";
import { useEffect, useState } from "react";
import customersMiddleware from "../../redux/middleware/customersMiddleware";
import ordersMiddleware from "../../redux/middleware/ordersMiddleware";

function Dashboard() {
  const dispatch = useDispatch();

  const [totalActiveOrders, settotalActiveOrders] = useState(0);
  const [totalsPendingOrders, setPendingOrders] = useState(0);

  const [totalActiveCustomers, settotalActiveCustomers] = useState(0);

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await dispatch(customersMiddleware.GetAllCustomers());
      const activeParticipants = response.data.filter(
        (participant) => participant.Status === "Active"
      );
      settotalActiveCustomers(activeParticipants.length);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await dispatch(ordersMiddleware.GetAllOrders());
      const activeOrders = response.data.filter(
        (order) => order.status === "Active"
      );
      const Pending = response.data.filter(
        (order) => order.Status === "Pending"
      );

      settotalActiveOrders(activeOrders.length);
      setPendingOrders(Pending.length);
      // Calculate total revenue for active orders
      // const totalRevenue = activeOrders.reduce((sum, order) => sum + (order.OrderCost || 0), 0);
      // settotalActiveOrdersRevenue(totalRevenue);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

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
    <div className="grid gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-3 rounded-lg shadow-md flex gap-2 items-center"
          >
            <img
              src={card.icon}
              alt={`${card.label} icon`}
              className="w-13 h-13"
            />
            <div>
              <h3 className="text-2xl font-bold mb-1">{card.value}</h3>
              <p className="text-gray-500 text-sm">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <ParticipantsTable />
    </div>
  );
}

export default Dashboard;
