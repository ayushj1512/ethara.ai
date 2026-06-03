import { Ban, CheckCircle2, ChevronRight, CircleDot, Filter, PackageCheck, Search, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../../components/DataTable.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchAdminOrders, updateOrderStatus } from "../../store/slices/adminSlice.js";
import { formatCurrency } from "../../utils/currency.js";

const lifecycle = ["pending", "confirmed", "packed", "shipped", "delivered"];
const statusMeta = {
  pending: { icon: CircleDot, label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { icon: ShieldCheck, label: "Confirmed", className: "bg-sky-50 text-sky-700 border-sky-200" },
  packed: { icon: PackageCheck, label: "Packed", className: "bg-violet-50 text-violet-700 border-violet-200" },
  shipped: { icon: Truck, label: "Shipped", className: "bg-teal-50 text-teal-700 border-teal-200" },
  delivered: { icon: CheckCircle2, label: "Delivered", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { icon: Ban, label: "Cancelled", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.admin.orders);
  const [filters, setFilters] = useState({ search: "", status: "all", sort: "newest" });

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const updateStatus = async (id, status) => {
    await dispatch(updateOrderStatus({ id, status })).unwrap();
    dispatch(fetchAdminOrders());
  };

  const nextStatus = (status) => {
    const index = lifecycle.indexOf(status);
    return index >= 0 && index < lifecycle.length - 1 ? lifecycle[index + 1] : null;
  };

  const columns = [
    { key: "order_number", label: "Order", render: (row) => <span className="font-semibold">{row.order_number}</span> },
    { key: "customer_id", label: "Customer", render: (row) => `#${row.customer_id}` },
    { key: "status", label: "Lifecycle", render: (row) => <Lifecycle status={row.status} /> },
    { key: "shipping", label: "Shipping address", render: (row) => [row.shipping_address_line1, row.shipping_address_line2, row.shipping_city, row.shipping_state, row.shipping_postal_code, row.shipping_country].filter(Boolean).join(", ") || "Not recorded" },
    { key: "discount_amount", label: "Discount", render: (row) => `-${formatCurrency(row.discount_amount)}` },
    { key: "total_amount", label: "Total", render: (row) => formatCurrency(row.total_amount) },
    { key: "created_at", label: "Created", render: (row) => new Date(row.created_at).toLocaleString() },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const next = nextStatus(row.status);
        const locked = row.status === "cancelled" || row.status === "delivered";
        return (
          <div className="flex min-w-[250px] flex-wrap gap-2">
            <button className="btn-secondary" disabled={!next || locked} onClick={() => updateStatus(row.id, next)}>
              <ChevronRight size={16} /> {next ? `Move to ${next}` : "Complete"}
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45" disabled={locked} onClick={() => updateStatus(row.id, "cancelled")}>
              <Ban size={16} /> Cancel
            </button>
          </div>
        );
      },
    },
  ];

  const rows = useMemo(() => {
    const visible = orders.filter((order) => {
      const searchText = `${order.order_number} ${order.customer_id} ${order.status} ${order.shipping_address_line1 || ""} ${order.shipping_city || ""} ${order.shipping_state || ""}`.toLowerCase();
      const matchesSearch = searchText.includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === "all" || order.status === filters.status;
      return matchesSearch && matchesStatus;
    });
    return [...visible].sort((a, b) => {
      if (filters.sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (filters.sort === "total_high") return Number(b.total_amount) - Number(a.total_amount);
      if (filters.sort === "total_low") return Number(a.total_amount) - Number(b.total_amount);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [orders, filters]);

  return (
    <>
      <PageHeader title="Orders" subtitle="Advance each order through pending, confirmed, packed, shipped, and delivered. Cancel is handled separately." />
      <section className="panel mb-4 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Filter size={16} /> Search, filter, and sort orders</div>
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <label className="search-field"><Search className="search-icon" size={18} /><input className="input search-input" placeholder="Search order, customer, status" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="all">All statuses</option>{[...lifecycle, "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}</select>
          <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="total_high">Total high-low</option><option value="total_low">Total low-high</option></select>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Showing {rows.length} of {orders.length} orders</p>
      </section>
      <DataTable rows={rows} columns={columns} />
    </>
  );
}

function Lifecycle({ status }) {
  if (status === "cancelled") {
    return <StatusPill status={status} />;
  }
  const currentIndex = lifecycle.indexOf(status);
  return (
    <div className="flex min-w-[430px] items-center gap-2">
      {lifecycle.map((item, index) => {
        const complete = index <= currentIndex;
        return (
          <div key={item} className="flex items-center gap-2">
            <StatusPill status={item} muted={!complete} />
            {index < lifecycle.length - 1 && <div className={`h-px w-5 ${index < currentIndex ? "bg-zinc-950" : "bg-zinc-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ status, muted = false }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${muted ? "border-zinc-200 bg-zinc-50 text-zinc-400" : meta.className}`}>
      <Icon size={13} /> {meta.label}
    </span>
  );
}
