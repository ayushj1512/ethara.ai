import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthPrompt from "../components/AuthPrompt.jsx";

export function CustomerAuthGuard() {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  return token && user?.role === "customer" ? (
    <Outlet />
  ) : (
    <AuthPrompt open onClose={() => navigate("/products")} title="Login required" message="Please login to continue this activity." />
  );
}

export function AdminAuthGuard() {
  const { token, user } = useSelector((state) => state.auth);
  return token && user?.role === "admin" ? <Outlet /> : <Navigate to="/admin" replace />;
}
