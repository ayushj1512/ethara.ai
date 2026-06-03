import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fetchOrders } from "../store/slices/ordersSlice.js";
import { formatCurrency } from "../utils/currency.js";

export default function Orders() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.items);
  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);
  return (
    <>
      <PageHeader title="My Orders" subtitle="Track order lifecycle, products, totals, and shipping address." />
      <DataTable rows={orders} columns={[
        { key: "order_number", label: "Order", render: (row) => <Link className="font-medium underline" to={`/orders/${row.id}`}>{row.order_number}</Link> },
        { key: "products", label: "Product details", render: (row) => <ProductSummary items={row.items || []} /> },
        { key: "my_address", label: "My address", render: (row) => <AddressSummary order={row} /> },
        { key: "status", label: "Status", render: (row) => <span className="capitalize">{row.status}</span> },
        { key: "total_amount", label: "Total", render: (row) => formatCurrency(row.total_amount) },
        { key: "created_at", label: "Created", render: (row) => new Date(row.created_at).toLocaleString() },
      ]} />
    </>
  );
}

function ProductSummary({ items }) {
  if (!items.length) return <span className="text-zinc-500">No products</span>;
  return (
    <div className="grid min-w-[260px] gap-2">
      {items.slice(0, 2).map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          {item.product?.image_url && <img src={item.product.image_url} alt={item.product_name} className="h-10 w-10 rounded-md object-cover" />}
          <div>
            <p className="text-sm font-semibold">{item.product_name}</p>
            <p className="text-xs text-zinc-500">{item.sku} - Qty {item.quantity} - {formatCurrency(item.line_total)}</p>
          </div>
        </div>
      ))}
      {items.length > 2 && <p className="text-xs text-zinc-500">+{items.length - 2} more products</p>}
    </div>
  );
}

function AddressSummary({ order }) {
  const address = [
    order.shipping_address_line1,
    order.shipping_address_line2,
    order.shipping_city,
    order.shipping_state,
    order.shipping_postal_code,
    order.shipping_country,
  ].filter(Boolean).join(", ");
  return <span className="block min-w-[240px] text-sm text-zinc-600">{address || "No address recorded"}</span>;
}
