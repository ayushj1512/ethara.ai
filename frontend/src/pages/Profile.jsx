import { CalendarDays, Home, Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import { fetchSessions, loadMe, updateProfile } from "../store/slices/authSlice.js";
import { fetchOrders } from "../store/slices/ordersSlice.js";
import { formatCurrency } from "../utils/currency.js";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, sessions } = useSelector((state) => state.auth);
  const orders = useSelector((state) => state.orders.items);
  const [form, setForm] = useState(null);

  useEffect(() => {
    dispatch(loadMe());
    dispatch(fetchSessions());
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    setForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
      address_line1: user.address_line1 || "",
      address_line2: user.address_line2 || "",
      city: user.city || "",
      state: user.state || "",
      postal_code: user.postal_code || "",
      country: user.country || "India",
    });
  }, [user]);

  const stats = useMemo(() => {
    const delivered = orders.filter((order) => order.status === "delivered");
    const totalSpend = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    return { totalOrders: orders.length, delivered: delivered.length, totalSpend };
  }, [orders]);

  if (!user) return null;

  const initials = user.full_name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "CU";
  const activeSessions = sessions.filter((session) => session.is_active);
  const address = [user.address_line1, user.address_line2, user.city, user.state, user.postal_code, user.country].filter(Boolean).join(", ");

  const submitProfile = async (event) => {
    event.preventDefault();
    await dispatch(updateProfile({
      ...form,
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      address_line1: form.address_line1.trim(),
      address_line2: form.address_line2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
      country: form.country.trim() || "India",
    })).unwrap();
    toast.success("Profile and shipping address updated.");
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account, contact details, sessions, and order activity." />

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="panel overflow-hidden">
          <div className="bg-zinc-950 p-6 text-white">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-teal-500 text-2xl font-bold">{initials}</div>
            <h1 className="mt-4 text-2xl font-semibold">{user.full_name}</h1>
            <p className="mt-1 text-sm text-zinc-300">{user.role}</p>
          </div>
          <div className="space-y-4 p-5">
            <InfoRow icon={<Mail size={18} />} label="Email" value={user.email} />
            <InfoRow icon={<Phone size={18} />} label="Phone" value={user.phone || "Not added"} />
            <InfoRow icon={<MapPin size={18} />} label="My address" value={address || "Add address before checkout"} />
            <InfoRow icon={<ShieldCheck size={18} />} label="Status" value={user.is_active ? "Active" : "Inactive"} />
            <InfoRow icon={<CalendarDays size={18} />} label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
          </div>
        </aside>

        <div className="grid gap-5">
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total orders" value={stats.totalOrders} />
            <StatCard label="Delivered" value={stats.delivered} />
            <StatCard label="Total spend" value={formatCurrency(stats.totalSpend)} />
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <UserRound size={19} />
              <h2 className="text-lg font-semibold">Account details</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Detail label="Customer ID" value={`#${user.id}`} />
              <Detail label="Role" value={user.role} />
              <Detail label="Created at" value={new Date(user.created_at).toLocaleString()} />
              <Detail label="Last updated" value={new Date(user.updated_at).toLocaleString()} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <Home size={19} />
              <h2 className="text-lg font-semibold">Shipping address</h2>
            </div>
            {form && (
              <form onSubmit={submitProfile} className="grid gap-3 md:grid-cols-2">
                <input className="input" required minLength="2" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className="input md:col-span-2" required minLength="3" placeholder="Address line 1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
                <input className="input md:col-span-2" placeholder="Address line 2" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
                <input className="input" required minLength="2" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input className="input" required minLength="2" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                <input className="input" required minLength="3" placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                <input className="input" required minLength="2" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                <button className="btn md:col-span-2"><Save size={16} /> Save address</button>
              </form>
            )}
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Sessions</h2>
              <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">{activeSessions.length} active</span>
            </div>
            <div className="grid gap-3">
              {sessions.length === 0 ? <p className="text-sm text-zinc-500">No session history yet.</p> : sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{session.device_info || "Unknown device"}</p>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${session.is_active ? "bg-teal-100 text-teal-700" : "bg-zinc-200 text-zinc-600"}`}>{session.is_active ? "Active" : "Revoked"}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">IP {session.ip_address || "unknown"} · Last activity {new Date(session.last_activity_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-teal-700">{icon}</div>
      <div>
        <p className="text-xs uppercase text-zinc-400">{label}</p>
        <p className="text-sm font-medium text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="panel p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs uppercase text-zinc-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
