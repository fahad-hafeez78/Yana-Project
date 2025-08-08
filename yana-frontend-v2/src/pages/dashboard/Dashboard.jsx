import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import customersMiddleware from "../../redux/middleware/customersMiddleware";
import ordersMiddleware from "../../redux/middleware/ordersMiddleware";
import usePermissionChecker from "../../util/permissionChecker/PermissionChecker";
import DashboardCards from "../../components/dashboard/DashBoardCards";
import ActiveParticipants from "../../components/dashboard/ActiveParticipants";

function Dashboard() {
  const dispatch = useDispatch();

  const [totalActiveOrders, settotalActiveOrders] = useState(0);
  const [totalsPendingOrders, setPendingOrders] = useState(0);

  const [totalActiveCustomers, settotalActiveCustomers] = useState(0);

  const checkPermission = usePermissionChecker();
  const isOrderViewPermission = checkPermission("order", "view");
  const isParticipantViewPermission = checkPermission("participant", "view");

  useEffect(() => {
    if (isParticipantViewPermission) fetchCustomers();
    if (isOrderViewPermission) fetchOrders();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await dispatch(customersMiddleware.GetAllCustomers('all'));
      const activeCustomers = response.customers.filter(
        (customer) => customer.status === "active"
      );
      settotalActiveCustomers(activeCustomers.length);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await dispatch(ordersMiddleware.GetAllOrders(null));
      const activeOrders = response?.orders?.filter(
        (order) => order.status === "active"
      );
      const pendingOrders = response?.orders?.filter(
        (order) => order.status === "pending"
      );
      settotalActiveOrders(activeOrders.length);
      setPendingOrders(pendingOrders.length);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <DashboardCards
        totalActiveOrders={totalActiveOrders}
        totalsPendingOrders={totalsPendingOrders}
        totalActiveCustomers={totalActiveCustomers}
      />
      <ActiveParticipants />
    </div>
  );
}

export default Dashboard;
