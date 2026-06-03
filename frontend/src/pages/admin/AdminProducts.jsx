import { Filter, Save, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import DataTable from "../../components/DataTable.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { deleteProduct, fetchAdminProducts, saveProduct, updateStock } from "../../store/slices/adminSlice.js";
import { formatCurrency } from "../../utils/currency.js";

const empty = { name: "", sku: "", category: "", description: "", price: 0, stock_quantity: 0, low_stock_threshold: 5, image_url: "", status: "active" };

export default function AdminProducts() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.admin.products);
  const [form, setForm] = useState(empty);
  const [filters, setFilters] = useState({ search: "", status: "all", category: "all", sort: "newest" });

  useEffect(() => { dispatch(fetchAdminProducts()); }, [dispatch]);

  const categories = useMemo(() => ["all", ...new Set(products.map((product) => product.category))], [products]);
  const rows = useMemo(() => {
    const visible = products.filter((product) => {
      const searchText = `${product.name} ${product.sku} ${product.category} ${product.status}`.toLowerCase();
      const matchesSearch = searchText.includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === "all" || product.status === filters.status;
      const matchesCategory = filters.category === "all" || product.category === filters.category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
    return [...visible].sort((a, b) => {
      if (filters.sort === "name") return a.name.localeCompare(b.name);
      if (filters.sort === "price_low") return Number(a.price) - Number(b.price);
      if (filters.sort === "price_high") return Number(b.price) - Number(a.price);
      if (filters.sort === "stock_low") return Number(a.stock_quantity) - Number(b.stock_quantity);
      if (filters.sort === "stock_high") return Number(b.stock_quantity) - Number(a.stock_quantity);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [products, filters]);

  const submit = async (event) => {
    event.preventDefault();
    await dispatch(saveProduct(form)).unwrap();
    setForm(empty);
    dispatch(fetchAdminProducts());
    toast.success("Product saved.");
  };

  return (
    <>
      <PageHeader title="Products" subtitle="Create and maintain product catalog, SKU uniqueness, and stock thresholds." />
      <form onSubmit={submit} className="panel mb-5 grid gap-3 p-4 md:grid-cols-4">
        {["name", "sku", "category", "image_url"].map((key) => <input key={key} className="input" placeholder={key.replace("_", " ")} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
        <input className="input" type="number" placeholder="price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input className="input" type="number" placeholder="stock" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
        <input className="input" type="number" placeholder="threshold" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} />
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>active</option><option>inactive</option><option>out_of_stock</option></select>
        <textarea className="input md:col-span-3" placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn"><Save size={16} /> Save</button>
      </form>

      <section className="panel mb-4 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Filter size={16} /> Search, filter, and sort products</div>
        <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <label className="search-field"><Search className="search-icon" size={18} /><input className="input search-input" placeholder="Search name, SKU, category" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
          <select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>{categories.map((category) => <option key={category} value={category}>{category === "all" ? "All categories" : category}</option>)}</select>
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="all">All status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="out_of_stock">Out of stock</option></select>
          <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}><option value="newest">Newest</option><option value="name">Name A-Z</option><option value="price_low">Price low-high</option><option value="price_high">Price high-low</option><option value="stock_low">Stock low-high</option><option value="stock_high">Stock high-low</option></select>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Showing {rows.length} of {products.length} products</p>
      </section>

      <DataTable rows={rows} columns={[
        { key: "name", label: "Product" }, { key: "sku", label: "SKU" }, { key: "status", label: "Status" },
        { key: "stock_quantity", label: "Stock", render: (row) => <input className="input w-24" type="number" defaultValue={row.stock_quantity} onBlur={(e) => dispatch(updateStock({ id: row.id, payload: { type: "adjustment", quantity: Number(e.target.value), note: "Admin adjustment" } })).then(() => dispatch(fetchAdminProducts()))} /> },
        { key: "price", label: "Price", render: (row) => formatCurrency(row.price) },
        { key: "actions", label: "", render: (row) => <div className="flex gap-2"><button className="btn-secondary" onClick={() => setForm(row)}>Edit</button><button className="btn-secondary" onClick={() => dispatch(deleteProduct(row.id)).then(() => dispatch(fetchAdminProducts()))}><Trash2 size={16} /></button></div> },
      ]} />
    </>
  );
}
