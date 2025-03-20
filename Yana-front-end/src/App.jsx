import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PERS from "./pages/pers/PERS";
import Analytics from './pages/analytics/Analytics';
import Chat from './pages/chat/Chat';
import Participants from './pages/participants/Participants';
import ClientDetailsForm from './components/participants/step2Form/Step2Form';
import ParticipantsDetails from './components/participants/participantsDetails/ParticipantsDetails';
import MyProfile from './components/navigation/myProfile/MyProfile';
import Dashboard from './pages/dashboard/Dashboard';
import Meals from './pages/meal/Meals';
// import AddMenus from "./components/menus/addMenus/AddMenus";
import AddMenu from "./components/menus/addMenus/AddMenu";

import AddMeals from './components/meals/addMeals/AddMeals'
import AssignWeeks from "./components/menus/assignWeeks/AssignWeeks";
import MealDetails from './components/meals/mealDetails/MealDetails';
import Layout from './components/navigation/layout/Layout';
import LoginPage from './pages/loginPage/LoginPage';
import Order from './pages/order/Order';
import PlaceOrder from './components/orders/placeOrders/PlaceOrder'
// import PlaceOrder from './components/orders/placeOrders/PlaceNewOrder'
import Reviews from './pages/reviews/Reviews';
import SplashScreen from './components/splashScreen/SplashScreen';
import Vendor from './pages/vendor/Vendors';
import CustomerChanges from './pages/participants/ParticipantChanges';
import FoodItemList from './components/vendors/FoodItemList';
import FoodItemDetail from "./components/vendors/FoodItemDetail";
import UMS from './pages/ums/UMS';
import AddUser from "./components/ums/addUser/AddUser";
import CreateRole from "./components/ums/createRole/CreateRole";
import ManageRoles from "./components/ums/manageRoles/ManageRoles";
import EditRole from "./components/ums/editRole/EditRole";
import Menus from './pages/menus/Menus';
import MenuDetails from "./components/menus/menuDetails/MenuDetails";
import AddVendor from "./components/vendors/AddVendor";
import EditVendor from "./components/vendors/EditVendor";
import EditMeals from "./components/meals/editMeal/EditMeal";
import ParticipantsRequests from "./components/participants/participantsRequests/ParticipantsRequests";

import MyErrorBoundary, { NotFoundPage } from "./components/errorPage/ErrorBoundary"; 

import './global.css';
import { useSelector } from "react-redux";
import OrdersDetails from "./components/orders/orderDetails/OrderDetails";
import Toast from "./elements/toast/Toast";
import PrivacyPolicy from './pages/privacyPolicy/PrivacyPolicy';
import EditUser from "./components/ums/editUser/EditUser";
import AddParticipant from "./components/participants/addParticipant/AddParticipant";

function App() {
  const { isAuthenticated } = useSelector((state) => state.user);

  return (
    <MyErrorBoundary>
    <Router>
      <Toast />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route
          path="/ums"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Layout>
                <UMS />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/dashboard/participants-details" element={<PrivateRoute isAuthenticated={isAuthenticated}><Layout ><ParticipantsDetails /></Layout></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Order /></Layout></PrivateRoute>} />
        <Route path="/orders/details" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><OrdersDetails /></Layout></PrivateRoute>} />
        <Route path="/orders/placeorder" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><PlaceOrder /></Layout></PrivateRoute>} />
        <Route path="/participants" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Participants /></Layout></PrivateRoute>} />
        <Route path="/participantChanges" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout><CustomerChanges /></Layout></PrivateRoute>} />
        <Route path="/participantsrequests" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout><ParticipantsRequests /></Layout></PrivateRoute>} />

        <Route path="/participants/add-participant" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><AddParticipant /></Layout></PrivateRoute>} />
        <Route path="/participants/client-details" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><ClientDetailsForm /></Layout></PrivateRoute>} />
        <Route path="/participants/detailed-info" element={<PrivateRoute isAuthenticated={isAuthenticated}><Layout ><ParticipantsDetails /></Layout></PrivateRoute>} />
        <Route path="/myprofile" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><MyProfile /></Layout></PrivateRoute>} />


        <Route path="/meals" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Meals /></Layout></PrivateRoute>} />
        <Route path="/meals/addmeals" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><AddMeals /></Layout></PrivateRoute>} />
        <Route path="/meals/editmeals" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><EditMeals /></Layout></PrivateRoute>} />
        <Route path="/meals/details/:mealId" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><MealDetails /></Layout></PrivateRoute>} />
        
        <Route path="/menus" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Menus /></Layout></PrivateRoute>} />
        <Route path="/menus/addmenus" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><AddMenu /></Layout></PrivateRoute>} />
        <Route path="/menus/assignweeks" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><AssignWeeks /></Layout></PrivateRoute>} />
        <Route path="/menus/details/:menuId" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><MenuDetails /></Layout></PrivateRoute>} />


        <Route path="/vendors" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Vendor /></Layout></PrivateRoute>} />
        <Route path="/vendors/:id/food-items" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><FoodItemList /></Layout></PrivateRoute>} />
        <Route path="/vendors/:id/food-item/:id" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><FoodItemDetail /></Layout></PrivateRoute>} />
        <Route path="/vendors/addvendor" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><AddVendor /></Layout></PrivateRoute>} />
        <Route path="/vendors/editvendor" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><EditVendor /></Layout></PrivateRoute>} />

        <Route path="/analytics" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Analytics /></Layout></PrivateRoute>} />
        <Route path="/reviews" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Reviews /></Layout></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Chat /></Layout></PrivateRoute>} />
        <Route path="/participants" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Chat /></Layout></PrivateRoute>} />
        <Route path="/creds" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><Chat /></Layout></PrivateRoute>} />
      
        <Route path="/ums" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><UMS /></Layout></PrivateRoute>} />
        <Route path="/ums/edit-user" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><EditUser /></Layout></PrivateRoute>} />
        
        <Route path="/ums/add-user" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><AddUser /></Layout></PrivateRoute>} />
        <Route path="/ums/create-role" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><CreateRole /></Layout></PrivateRoute>} />
        <Route path="/ums/manage-role" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><ManageRoles /></Layout></PrivateRoute>} />
        <Route path="/ums/manage-role/edit-role" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><EditRole /></Layout></PrivateRoute>} />
        <Route path="/pers" element={<PrivateRoute isAuthenticated={isAuthenticated} ><Layout ><PERS /></Layout></PrivateRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />

      
      </Routes>
    </Router>
    </MyErrorBoundary>
  
);
}

function PrivateRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default App;
