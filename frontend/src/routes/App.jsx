import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Shell from "../layouts/Shell.jsx";
import { CustomerAuthGuard } from "./guards.jsx";
import Login from "../pages/Login.jsx";
import Products from "../pages/Products.jsx";
import ProductDetail from "../pages/ProductDetail.jsx";
import Cart from "../pages/Cart.jsx";
import Orders from "../pages/Orders.jsx";
import OrderDetail from "../pages/OrderDetail.jsx";
import Profile from "../pages/Profile.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminProducts from "../pages/admin/AdminProducts.jsx";
import AdminOrders from "../pages/admin/AdminOrders.jsx";
import AdminCustomers from "../pages/admin/AdminCustomers.jsx";
import AdminInventory from "../pages/admin/AdminInventory.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<Navigate to="/products" replace />} />
        <Route path="/signup" element={<Navigate to="/products" replace />} />
        <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
        <Route element={<Shell />}>
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route element={<CustomerAuthGuard />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="/admin" element={<AdminEntry />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function AdminEntry() {
  const user = useSelector((state) => state.auth.user);
  return user?.role === "admin" ? <Shell admin /> : <Login admin />;
}
