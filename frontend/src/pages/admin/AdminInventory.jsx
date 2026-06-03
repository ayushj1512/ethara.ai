import { Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../../components/DataTable.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchAdminProducts, fetchTransactions } from "../../store/slices/adminSlice.js";

export default function AdminInventory() {
  const dispatch = useDispatch();
  const { products, transactions } = useSelector((state) => state.admin);
  const [inventoryFilters, setInventoryFilters] = useState({ search: "", status: "all", sort: "stock_low" });
  const [transactionFilters, setTransactionFilters] = useState({ search: "", type: "all", sort: "newest" });

  useEffect(() => { dispatch(fetchAdminProducts()); dispatch(fetchTransactions()); }, [dispatch]);

  const inventoryRows = useMemo(() => {
    const visible = products.filter((product) => {
      const searchText = `${product.name} ${product.sku} ${product.category} ${product.status}`.toLowerCase();
      const matchesSearch = searchText.includes(inventoryFilters.search.toLowerCase());
      const matchesStatus =
        inventoryFilters.status === "all" ||
        product.status === inventoryFilters.status ||
        (inventoryFilters.status === "low_stock" && product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold);
      return matchesSearch && matchesStatus;
    });
    return [...visible].sort((a, b) => {
      if (inventoryFilters.sort === "stock_high") return Number(b.stock_quantity) - Number(a.stock_quantity);
      if (inventoryFilters.sort === "threshold") return Number(a.low_stock_threshold) - Number(b.low_stock_threshold);
      if (inventoryFilters.sort === "name") return a.name.localeCompare(b.name);
      return Number(a.stock_quantity) - Number(b.stock_quantity);
    });
  }, [products, inventoryFilters]);

  const transactionRows = useMemo(() => {
    const visible = transactions.filter((transaction) => {
      const searchText = `${transaction.id} ${transaction.product_id} ${transaction.type} ${transaction.note || ""}`.toLowerCase();
      const matchesSearch = searchText.includes(transactionFilters.search.toLowerCase());
      const matchesType = transactionFilters.type === "all" || transaction.type === transactionFilters.type;
      return matchesSearch && matchesType;
    });
    return [...visible].sort((a, b) => {
      if (transactionFilters.sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (transactionFilters.sort === "qty_high") return Number(b.quantity) - Number(a.quantity);
      if (transactionFilters.sort === "qty_low") return Number(a.quantity) - Number(b.quantity);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [transactions, transactionFilters]);

  return (
    <div className="grid gap-6">
      <section>
        <PageHeader title="Inventory" subtitle="Low stock and out-of-stock products surface here first." />
        <section className="panel mb-4 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Filter size={16} /> Search, filter, and sort inventory</div>
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
            <label className="search-field"><Search className="search-icon" size={18} /><input className="input search-input" placeholder="Search product, SKU, category" value={inventoryFilters.search} onChange={(e) => setInventoryFilters({ ...inventoryFilters, search: e.target.value })} /></label>
            <select className="input" value={inventoryFilters.status} onChange={(e) => setInventoryFilters({ ...inventoryFilters, status: e.target.value })}><option value="all">All inventory</option><option value="active">Active</option><option value="out_of_stock">Out of stock</option><option value="low_stock">Low stock</option><option value="inactive">Inactive</option></select>
            <select className="input" value={inventoryFilters.sort} onChange={(e) => setInventoryFilters({ ...inventoryFilters, sort: e.target.value })}><option value="stock_low">Stock low-high</option><option value="stock_high">Stock high-low</option><option value="threshold">Threshold low-high</option><option value="name">Name A-Z</option></select>
          </div>
          <p className="mt-3 text-sm text-zinc-500">Showing {inventoryRows.length} of {products.length} products</p>
        </section>
        <DataTable rows={inventoryRows} columns={[{ key: "name", label: "Product" }, { key: "sku", label: "SKU" }, { key: "stock_quantity", label: "Stock" }, { key: "low_stock_threshold", label: "Low threshold" }, { key: "status", label: "Status" }]} />
      </section>

      <section>
        <PageHeader title="Transactions" subtitle="Immutable audit trail for stock changes and order deductions." />
        <section className="panel mb-4 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Filter size={16} /> Search, filter, and sort transactions</div>
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
            <label className="search-field"><Search className="search-icon" size={18} /><input className="input search-input" placeholder="Search ID, product ID, type, note" value={transactionFilters.search} onChange={(e) => setTransactionFilters({ ...transactionFilters, search: e.target.value })} /></label>
            <select className="input" value={transactionFilters.type} onChange={(e) => setTransactionFilters({ ...transactionFilters, type: e.target.value })}><option value="all">All types</option><option value="stock_in">Stock in</option><option value="stock_out">Stock out</option><option value="order_deduction">Order deduction</option><option value="adjustment">Adjustment</option></select>
            <select className="input" value={transactionFilters.sort} onChange={(e) => setTransactionFilters({ ...transactionFilters, sort: e.target.value })}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="qty_high">Qty high-low</option><option value="qty_low">Qty low-high</option></select>
          </div>
          <p className="mt-3 text-sm text-zinc-500">Showing {transactionRows.length} of {transactions.length} transactions</p>
        </section>
        <DataTable rows={transactionRows} columns={[{ key: "id", label: "ID" }, { key: "product_id", label: "Product ID" }, { key: "type", label: "Type" }, { key: "quantity", label: "Qty" }, { key: "note", label: "Note" }, { key: "created_at", label: "Created", render: (row) => new Date(row.created_at).toLocaleString() }]} />
      </section>
    </div>
  );
}
