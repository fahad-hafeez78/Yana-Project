import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PERS from "./pages/pers/PERS";
import Chats from './pages/chats/Chats';
import Participants from './pages/participants/Participants';
import MyProfile from './components/navigation/myProfile/MyProfile';
import Dashboard from './pages/dashboard/Dashboard';
import Meals from './pages/meal/Meals';
import AddMenus from "./components/menus/addMenus/AddMenus";
import AssignWeeks from "./components/menus/assignWeeks/AssignWeeks";
import MealDetails from './components/meals/mealDetails/MealDetails';
import Layout from './components/navigation/layout/Layout';
import LoginPage from './pages/loginPage/LoginPage';
import Order from './pages/order/Order';
import PlaceOrder from './components/orders/placeOrders/PlaceOrder'
import Reviews from './pages/reviews/Reviews';
import SplashScreen from './components/general/splashScreen/SplashScreen';
import Vendor from './pages/vendor/Vendors';
import CustomerChanges from './pages/participants/ParticipantChanges';
import FoodItemList from './components/vendors/FoodItemList';
import FoodItemDetail from "./components/vendors/FoodItemDetail";
import Users from './pages/ums/Users';
import Roles from './pages/ums/Roles';

import AddUser from "./components/ums/addUser/AddUser";
import CreateRole from "./components/ums/createRole/CreateRole";
// import ManageRoles from "./components/ums/manageRoles/ManageRoles";
import EditRole from "./components/ums/editRole/EditRole";
import Menus from './pages/menus/Menus';
import MenuDetails from "./components/menus/menuDetails/MenuDetails";
// import AddVendor from "./components/vendors/AddVendor";
import EditVendor from "./components/vendors/EditVendor";
import ParticipantsRequests from "./components/participants/participantsRequests/ParticipantsRequests";

import MyErrorBoundary, { NotFoundPage } from "./components/general/errorPage/ErrorBoundary";

import './global.css';
import { useDispatch, useSelector } from "react-redux";
import OrdersDetails from "./components/orders/orderDetails/OrderDetails";
import Toast from "./elements/toast/Toast";
import PrivacyPolicy from './pages/privacyPolicy/PrivacyPolicy';
import EditUser from "./components/ums/editUser/EditUser";
import ForgotPassword from "./components/navigation/forgotPassword/ForgotPassword";
import VerifyPasswordOTP from "./components/navigation/forgotPassword/VerifyPasswordOTP";
import ResetPassword from "./components/navigation/forgotPassword/ResetPassword";

import Tasks from "./pages/tasks/Tasks";
import CreateNewTask from "./components/tasks/CreateNewTask/CreateNewTask";

import Riders from "./pages/riders/Riders";
// import AllZones from "./components/riders/zones/AllZones";
import TrackRiders from "./components/riders/trackRiders/TrackRiders";
// import OrderAssignment from "./components/riders/orderAssignment/OrderAssignment";
import RidersRoutes from "./pages/routes/RidersRoutes";
import RouteDetails from "./components/routes/RouteDetails";
import TaskDetails from "./components/tasks/TaskDetails/TaskDetails";
import Tickets from "./pages/tickets/Tickets";
import TicketDetails from "./components/tickets/TicketDetails/TicketDetails";
import { disconnectSocket, emitSocketEvent, initializeSocket, offSocketEvent, onSocketEvent } from "./config/webSocket";
import { setAllActiveUsers, setUnReadChats } from "./redux/reducers/userChatsReducer";
import CreateRider from "./components/riders/riders/CreateRider";
import EditRider from "./components/riders/riders/EditRider";
import { logout, updateUser } from "./redux/actions/userAction";
import ReviewDetails from "./components/reviews/reviewDetails/ReviewDetails";
import RidersPrivacyPolicy from "./pages/ridersPrivacyPolicy/RidersPrivacyPolicy";
import usePermissionChecker from "./util/permissionChecker/PermissionChecker";
import Trash from "./pages/trash/Trash";
import ParticipantFields from "./components/participants/participantFields/ParticipantFields";
import Claims from "./pages/Billing/Claims";
import AddClaim from "./components/Billings/claims/AddClaim";
import EditClaim from "./components/Billings/claims/EditClaim";
import BillingDashboard from "./pages/Billing/BillingDashboard";
import AddMeals from "./components/meals/addMeals/AddMeals";
import EditMeal from "./components/meals/editMeal/EditMeal";
import { logoutAsync } from "./redux/reducers/userReducer";
import { showErrorAlert } from "./redux/actions/alertActions";
import FirebaseNotification from "./util/firebaseNotifications/FirebaseNotification";
import { onMessageListener, requestForToken } from "./config/firebase";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.user);
  const checkPermission = usePermissionChecker();

  useEffect(() => {

    if (token) {
      dispatch(updateUser());
      initializeSocket(token);

      onSocketEvent('forceLogout', ({ message }) => {
        dispatch(showErrorAlert(message));
        dispatch(logout());
      });

      onSocketEvent('activeUsers', (users) => {
        dispatch(setAllActiveUsers(users));
      });

      emitSocketEvent('unread-chats-and-messages');

      onSocketEvent('unread-chats-and-messages', (data) => {
        dispatch(setUnReadChats(data.unreadChats));
      });

      const cleanAllActiveUsers = () => {
        dispatch(setAllActiveUsers([]));
      };

      return () => {
        offSocketEvent('unread-chats-and-messages', {})
        offSocketEvent('forceLogout', {})

        cleanAllActiveUsers();
        disconnectSocket();
      }
    }
  }, [token]);

  return (
    <MyErrorBoundary>
      <Router>
        <Toast />
        <FirebaseNotification />
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/riders-privacy-policy" element={<RidersPrivacyPolicy />} />
          {/* <Route
          path="/user"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <UMS />
              </Layout>
            </PrivateRoute>
          }
        /> */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/login/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
          <Route path="/login/verify-OTP" element={isAuthenticated ? <Navigate to="/dashboard" /> : <VerifyPasswordOTP />} />
          <Route path="/login/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword />} />

          <Route path="/dashboard" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={true}><Layout><Dashboard /></Layout></PrivateRoute>} />
          {/* <Route path="/dashboard/participants-details" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('participant','view')}><Layout ><ParticipantsDetails /></Layout></PrivateRoute>} /> */}
          <Route path="/orders" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('order', 'view')}><Layout ><Order /></Layout></PrivateRoute>} />
          <Route path="/orders/details" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('order', 'view')}><Layout ><OrdersDetails /></Layout></PrivateRoute>} />
          <Route path="/orders/placeorder" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('order', 'create')}><Layout ><PlaceOrder /></Layout></PrivateRoute>} />
          <Route path="/participants" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('participant', 'view')}><Layout ><Participants /></Layout></PrivateRoute>} />
          <Route path="/participants/participant-fields" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('participant', 'view')}><Layout ><ParticipantFields /></Layout></PrivateRoute>} />

          <Route path="/participant-changes" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('participant_changes', 'view')}><Layout><CustomerChanges /></Layout></PrivateRoute>} />
          <Route path="/participants-requests" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('participant_requests', 'view')}><Layout><ParticipantsRequests /></Layout></PrivateRoute>} />

          {/* <Route path="/participants/add-participant" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('participant','create')}><Layout ><AddParticipant /></Layout></PrivateRoute>} /> */}
          {/* <Route path="/participants/client-details" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('participant','edit')}><Layout ><ClientDetailsForm /></Layout></PrivateRoute>} /> */}
          {/* <Route path="/participants/detailed-info" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('participant','view')}><Layout ><ParticipantsDetails /></Layout></PrivateRoute>} /> */}
          <Route path="/myprofile" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={true}><Layout ><MyProfile /></Layout></PrivateRoute>} />


          <Route path="/meals" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('meal', 'view')}><Layout ><Meals /></Layout></PrivateRoute>} />
          <Route path="/meals/add-meals" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('meal', 'create')}><Layout ><AddMeals /></Layout></PrivateRoute>} />
          <Route path="/meals/edit-meals" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('meal', 'edit')}><Layout ><EditMeal /></Layout></PrivateRoute>} />
          <Route path="/meals/details/:mealId" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('meal', 'view')}><Layout ><MealDetails /></Layout></PrivateRoute>} />

          <Route path="/menus" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('menu', 'view')}><Layout ><Menus /></Layout></PrivateRoute>} />
          <Route path="/menus/add-menu" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('menu', 'create')}><Layout ><AddMenus /></Layout></PrivateRoute>} />
          <Route path="/menus/assignweeks" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('menu', 'menuAssign')}><Layout ><AssignWeeks /></Layout></PrivateRoute>} />
          <Route path="/menus/details/:menuId" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('menu', 'view')}><Layout ><MenuDetails /></Layout></PrivateRoute>} />


          <Route path="/vendors" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('vendor', 'view')}><Layout ><Vendor /></Layout></PrivateRoute>} />
          <Route path="/vendors/:id/food-items" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('vendor', 'view')}><Layout ><FoodItemList /></Layout></PrivateRoute>} />
          <Route path="/vendors/:id/food-item/:id" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('vendor', 'view')}><Layout ><FoodItemDetail /></Layout></PrivateRoute>} />
          {/* <Route path="/vendors/addvendor" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><AddVendor /></Layout></PrivateRoute>} /> */}
          <Route path="/vendors/edit-vendor" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('vendor', 'view')}><Layout ><EditVendor /></Layout></PrivateRoute>} />


          <Route path="/reviews" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('review', 'view')}><Layout ><Reviews /></Layout></PrivateRoute>} />
          <Route path="/reviews/review-details" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('review', 'view')}><Layout ><ReviewDetails /></Layout></PrivateRoute>} />
          <Route path="/chats" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('chat', 'view')}><Layout ><Chats /></Layout></PrivateRoute>} />
          {/* <Route path="/participants" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Chat /></Layout></PrivateRoute>} /> */}
          {/* <Route path="/creds" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Chat /></Layout></PrivateRoute>} /> */}

          <Route path="/tasks" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('task', 'view')}><Layout ><Tasks /></Layout></PrivateRoute>} />
          <Route path="/tasks/create-task" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('task', 'create')}><Layout ><CreateNewTask /></Layout></PrivateRoute>} />
          <Route path="/task-details" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('task', 'view')}><Layout ><TaskDetails /></Layout></PrivateRoute>} />

          <Route path="/tickets" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('ticket', 'view')}><Layout ><Tickets /></Layout></PrivateRoute>} />
          <Route path="/tickets/ticket-details" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('ticket', 'view')}><Layout ><TicketDetails /></Layout></PrivateRoute>} />

          <Route path="/riders" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('rider', 'view')}><Layout ><Riders /></Layout></PrivateRoute>} />

          <Route path="/riders/add-rider" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('rider', 'create')}><Layout ><CreateRider /></Layout></PrivateRoute>} />
          <Route path="/riders/edit-rider" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('rider', 'view')}><Layout ><EditRider /></Layout></PrivateRoute>} />

          {/* <Route path="/zones" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('zone','view')}><Layout ><AllZones /></Layout></PrivateRoute>} /> */}
          {/* <Route path="/track-riders" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('dashboard','view')}><Layout ><TrackRiders /></Layout></PrivateRoute>} /> */}
          {/* <Route path="/order-assignment" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('order_assignment','view')}><Layout ><OrderAssignment /></Layout></PrivateRoute>} /> */}

          <Route path="/routes" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('route', 'view')}><Layout ><RidersRoutes /></Layout></PrivateRoute>} />
          <Route path="routes/route-detail" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('route', 'view')}><Layout ><RouteDetails /></Layout></PrivateRoute>} />

          <Route path="/users" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('user', 'view')}><Layout ><Users /></Layout></PrivateRoute>} />
          <Route path="/users/edit-user" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('user', 'view')}><Layout ><EditUser /></Layout></PrivateRoute>} />

          <Route path="/users/add-user" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('user', 'create')}><Layout ><AddUser /></Layout></PrivateRoute>} />

          <Route path="/roles" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={user?.role?.name === 'admin'}><Layout ><Roles /></Layout></PrivateRoute>} />

          <Route path="/roles/create-role" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={user?.role?.name === 'admin'}><Layout ><CreateRole /></Layout></PrivateRoute>} />
          {/* <Route path="/user/manage-role" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><ManageRoles /></Layout></PrivateRoute>} /> */}
          <Route path="/roles/edit-role" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={user?.role?.name === 'admin'}><Layout ><EditRole /></Layout></PrivateRoute>} />
          <Route path="/pers" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('pers', 'view')}><Layout ><PERS /></Layout></PrivateRoute>} />
          <Route path="/trash" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={user?.role?.name === 'admin'}><Layout ><Trash /></Layout></PrivateRoute>} />
          <Route path="/billing/claims" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('claim', 'view')}><Layout ><Claims /></Layout></PrivateRoute>} />
          <Route path="/billing/claims/add-claim" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('claim', 'create')}><Layout ><AddClaim /></Layout></PrivateRoute>} />
          <Route path="/billing/claims/edit-claim" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('claim', 'edit')}><Layout ><EditClaim /></Layout></PrivateRoute>} />

          <Route path="/billing/dashboard" element={<PrivateRoute isAuthenticated={isAuthenticated} isPermission={checkPermission('claim', 'view')}><Layout ><BillingDashboard /></Layout></PrivateRoute>} />

          <Route path="*" element={<NotFoundPage />} />


        </Routes>
      </Router>
    </MyErrorBoundary>

  );
}

function PrivateRoute({ children, isAuthenticated, isPermission }) {
  return (isAuthenticated && !isPermission) ? <Navigate to="/dashboard" replace /> :
    (isAuthenticated && isPermission) ?
      children : <Navigate to="/login" replace />;
}

export default App;
