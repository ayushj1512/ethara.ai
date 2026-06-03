import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Boxes, ClipboardList, Gift, LayoutDashboard, LogIn, LogOut, Package, ReceiptText, ShieldCheck, ShoppingBag, UserRound, UsersRound, Warehouse } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AuthPrompt from "../components/AuthPrompt.jsx";
import { clearAuth, logout } from "../store/slices/authSlice.js";

const customerLinks = [
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/cart", label: "Cart", icon: ShoppingBag },
  { to: "/orders", label: "Orders", icon: ReceiptText },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/customers", label: "Customers", icon: UsersRound },
  { to: "/admin/inventory", label: "Inventory", icon: Warehouse },
];

export default function Shell({ admin = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.data?.items || []);
  const [loginOpen, setLoginOpen] = useState(false);
  const links = admin ? adminLinks : customerLinks;
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const signOut = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch {
      dispatch(clearAuth());
    }
    navigate(admin ? "/admin" : "/products");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to={admin ? "/admin" : "/products"} className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm transition group-hover:bg-teal-800">
              {admin ? <BarChart3 size={21} /> : <Package size={21} />}
            </div>
            <div>
              <p className="text-lg font-bold leading-5 tracking-tight">Ethara</p>
              <p className="text-xs font-medium text-zinc-500">{admin ? "Admin operations" : "Inventory store"}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 lg:flex">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:bg-white hover:text-zinc-950"}`}
              >
                <Icon size={16} />
                {label}
                {!admin && label === "Cart" && cartCount > 0 && <span className="ml-0.5 rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{cartCount}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!admin && !user && (
              <button className="hidden items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm sm:inline-flex" onClick={() => setLoginOpen(true)}>
                <Gift size={16} /> 10% off
              </button>
            )}
            {admin && <span className="hidden rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-white sm:inline-flex"><ShieldCheck size={16} className="mr-2" /> Admin</span>}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 shadow-sm sm:flex">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-100 text-xs font-bold text-teal-800">{initials(user.full_name)}</div>
                  <span className="max-w-32 truncate text-sm font-medium text-zinc-700">{user.full_name}</span>
                </div>
                <button className="btn-secondary" onClick={signOut}><LogOut size={16} /> Logout</button>
              </div>
            ) : (
              <button className="btn-secondary" onClick={() => admin ? navigate("/admin") : setLoginOpen(true)}><LogIn size={16} /> Login</button>
            )}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-zinc-100 bg-white px-4 py-2 lg:hidden">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `relative inline-flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              <Icon size={16} />
              {label}
              {!admin && label === "Cart" && cartCount > 0 && <span className="rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{cartCount}</span>}
            </NavLink>
          ))}
        </nav>
      </header>

      {!admin && <AuthPrompt open={loginOpen} onClose={() => setLoginOpen(false)} title="Login to unlock your offer" message="Browse freely. Login only when you want cart, checkout, orders, or profile access." />}
      <main className="w-full px-4 py-6 sm:px-6"><Outlet /></main>
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
}
