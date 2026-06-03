import { Filter, KeyRound, Save, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import DataTable from "../../components/DataTable.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchCustomers, resetCustomerPassword } from "../../store/slices/adminSlice.js";

export default function AdminCustomers() {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.admin.customers);
  const [resetForm, setResetForm] = useState({ customerId: null, password: "" });
  const [filters, setFilters] = useState({ search: "", status: "all", sort: "newest" });

  useEffect(() => { dispatch(fetchCustomers()); }, [dispatch]);

  const rows = useMemo(() => {
    const visible = customers.filter((customer) => {
      const searchText = `${customer.full_name} ${customer.email} ${customer.phone || ""} ${customer.role} ${customer.address_line1 || ""} ${customer.city || ""} ${customer.state || ""} ${customer.postal_code || ""}`.toLowerCase();
      const matchesSearch = searchText.includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === "all" || (filters.status === "active" ? customer.is_active : !customer.is_active);
      return matchesSearch && matchesStatus;
    });
    return [...visible].sort((a, b) => {
      if (filters.sort === "name") return a.full_name.localeCompare(b.full_name);
      if (filters.sort === "email") return a.email.localeCompare(b.email);
      if (filters.sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [customers, filters]);

  const startReset = (customer) => setResetForm({ customerId: customer.id, password: "" });
  const cancelReset = () => setResetForm({ customerId: null, password: "" });
  const submitReset = async (customer) => {
    if (resetForm.password.length < 7) {
      toast.error("Password must be at least 7 characters.");
      return;
    }
    await dispatch(resetCustomerPassword({ id: customer.id, new_password: resetForm.password })).unwrap();
    toast.success(`Password reset for ${customer.full_name}.`);
    cancelReset();
  };

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "My address", render: (row) => [row.address_line1, row.address_line2, row.city, row.state, row.postal_code, row.country].filter(Boolean).join(", ") || "Not added" },
    { key: "is_active", label: "Active", render: (row) => row.is_active ? "Yes" : "No" },
    { key: "created_at", label: "Created", render: (row) => new Date(row.created_at).toLocaleString() },
    { key: "actions", label: "Password", render: (row) => resetForm.customerId === row.id ? (
      <div className="flex min-w-[280px] items-center gap-2">
        <input className="input" type="password" minLength="7" placeholder="New password" value={resetForm.password} onChange={(event) => setResetForm({ ...resetForm, password: event.target.value })} />
        <button className="btn-secondary" type="button" onClick={() => submitReset(row)}><Save size={16} /></button>
        <button className="btn-secondary" type="button" onClick={cancelReset}><X size={16} /></button>
      </div>
    ) : <button className="btn-secondary" type="button" onClick={() => startReset(row)}><KeyRound size={16} /> Reset</button> },
  ];

  return (
    <>
      <PageHeader title="Customers" subtitle="Customer accounts created through signup or seed data." />
      <section className="panel mb-4 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Filter size={16} /> Search, filter, and sort customers</div>
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <label className="search-field"><Search className="search-icon" size={18} /><input className="input search-input" placeholder="Search name, email, phone" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="all">All customers</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A-Z</option><option value="email">Email A-Z</option></select>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Showing {rows.length} of {customers.length} customers</p>
      </section>
      <DataTable rows={rows} columns={columns} />
    </>
  );
}
