import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { StoreProvider } from '../store/StoreContext';
import Navbar from '../components/layout/Navbar/Navbar';
import Home from '../pages/Home/Home';
import Menu from '../pages/Restaurants/Menu';
import FoodDetails from '../pages/FoodDetails/FoodDetails';
import Cart from '../pages/Cart/CartPage';
import Checkout from '../pages/Checkout/CheckoutPage';
import OrderSuccess from '../pages/Orders/OrderSuccess';
import OrderTracking from '../pages/Orders/OrderTracking';
import Orders from '../pages/Orders/OrdersPage';
import Profile from '../pages/Profile/ProfilePage';
import About from '../pages/About/About';
import AdminLayout from '../components/layout/Sidebar/AdminLayout';
import Dashboard from '../pages/Admin/Dashboard';
import FoodManagement from '../pages/Admin/FoodManagement';
import AddFood from '../pages/Admin/AddFood';
import EditFood from '../pages/Admin/EditFood';
import OrdersManagement from '../pages/Admin/OrdersManagement';
import LocationsManagement from '../pages/Admin/LocationsManagement';
import CustomersManagement from '../pages/Admin/CustomersManagement';
import AdminLogin from '../pages/Admin/AdminLogin';
import StoreClosed from '../components/layout/StoreClosed';
import { useStore } from '../store/StoreContext';

import StockManagement from '../pages/Admin/StockManagement';

const CustomerLayout: React.FC = () => {
  const { isStoreOpen, storeReopenDate, storeCloseReason, storeCloseType } = useStore();
  
  if (!isStoreOpen) {
    return <StoreClosed reopenDate={storeReopenDate} closeReason={storeCloseReason} closeType={storeCloseType} />;
  }
  
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <StoreProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<Menu />} />
            <Route path="about" element={<About />} />
            <Route path="food/:id" element={<FoodDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-success/:id" element={<OrderSuccess />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderTracking />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="foods" element={<FoodManagement />} />
            <Route path="foods/add" element={<AddFood />} />
            <Route path="foods/:id/edit" element={<EditFood />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="customers" element={<CustomersManagement />} />
            <Route path="locations" element={<LocationsManagement />} />
            {/* Additional admin routes could go here */}
          </Route>
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
