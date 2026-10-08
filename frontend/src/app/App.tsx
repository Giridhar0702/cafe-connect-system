import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/menu" element={<><Navbar /><Menu /></>} />
          <Route path="/about" element={<><Navbar /><About /></>} />
          <Route path="/food/:id" element={<><Navbar /><FoodDetails /></>} />
          <Route path="/cart" element={<><Navbar /><Cart /></>} />
          <Route path="/checkout" element={<><Navbar /><Checkout /></>} />
          <Route path="/order-success/:id" element={<><Navbar /><OrderSuccess /></>} />
          <Route path="/orders" element={<><Navbar /><Orders /></>} />
          <Route path="/orders/:id" element={<><Navbar /><OrderTracking /></>} />
          <Route path="/profile" element={<><Navbar /><Profile /></>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="foods" element={<FoodManagement />} />
            <Route path="foods/add" element={<AddFood />} />
            <Route path="foods/:id/edit" element={<EditFood />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="locations" element={<LocationsManagement />} />
            {/* Additional admin routes could go here */}
          </Route>
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
