import { AlertTriangle, BarChart3, Boxes, Clock, IndianRupee, PackageX, ReceiptText, TrendingUp, UsersRound, Warehouse } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchAdminOrders, fetchAdminProducts, fetchCustomers, fetchStats, fetchTransactions } from "../../store/slices/adminSlice.js";
import { formatCurrency } from "../../utils/currency.js";

const statusColors = {
  pending: "bg-amber-500",
  confirmed: "bg-sky-500",
  packed: "bg-violet-500",
  shipped: "bg-teal-500",
  delivered: "bg-emerald-600",
  cancelled: "bg-rose-600",
};

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, products, orders, customers, transactions } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminOrders());
    dispatch(fetchCustomers());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const analytics = useMemo(() => {
    const orderStatus = orders.reduce((acc, order) => ({ ...acc, [order.status]: (acc[order.status] || 0) + 1 }), {});
    const topStock = [...products].sort((a, b) => Number(b.stock_quantity) - Number(a.stock_quantity)).slice(0, 5);
    const lowStock = products.filter((product) => product.stock_quantity <= product.low_stock_threshold).sort((a, b) => a.stock_quantity - b.stock_quantity).slice(0, 5);
    const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
    const recentTransactions = [...transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    const maxStock = Math.max(...topStock.map((product) => Number(product.stock_quantity || 0)), 1);
    const totalCartRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const avgOrderValue = orders.length ? totalCartRevenue / orders.length : 0;
    return { orderStatus, topStock, lowStock, recentOrders, recentTransactions, maxStock, avgOrderValue };
  }, [orders, products, transactions]);

  const cards = [
    { label: "Products", value: stats?.total_products || 0, icon: Boxes, accent: "text-teal-700", sub: `${stats?.out_of_stock_products || 0} out of stock` },
    { label: "Customers", value: stats?.total_customers || 0, icon: UsersRound, accent: "text-sky-700", sub: `${customers.length} accounts loaded` },
    { label: "Orders", value: stats?.total_orders || 0, icon: ReceiptText, accent: "text-violet-700", sub: `${stats?.pending_orders || 0} pending` },
    { label: "Revenue", value: formatCurrency(stats?.total_revenue), icon: IndianRupee, accent: "text-emerald-700", sub: `AOV ${formatCurrency(analytics.avgOrderValue)}` },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Analytics, stock health, recent activity, and fulfillment signals." />

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <MetricCard key={card.label} {...card} />)}
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Order Status Analytics</h2>
              <p className="text-sm text-zinc-500">Fulfillment distribution across all orders.</p>
            </div>
            <BarChart3 className="text-zinc-400" size={22} />
          </div>
          <div className="space-y-4">
            {["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"].map((status) => {
              const count = analytics.orderStatus[status] || 0;
              const percent = orders.length ? Math.round((count / orders.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize text-zinc-700">{status}</span>
                    <span className="font-semibold">{count} · {percent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                    <div className={`h-full rounded-full ${statusColors[status]}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Inventory Health</h2>
              <p className="text-sm text-zinc-500">Critical stock signals.</p>
            </div>
            <Warehouse className="text-zinc-400" size={22} />
          </div>
          <div className="grid gap-3">
            <HealthRow icon={AlertTriangle} label="Low stock products" value={stats?.low_stock_products || 0} tone="amber" />
            <HealthRow icon={PackageX} label="Out of stock products" value={stats?.out_of_stock_products || 0} tone="rose" />
            <HealthRow icon={TrendingUp} label="Active stock units" value={products.reduce((sum, product) => sum + Number(product.stock_quantity || 0), 0)} tone="teal" />
          </div>
        </div>
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-lg font-semibold">Top Stocked Products</h2>
          <p className="mb-4 text-sm text-zinc-500">Highest current quantity.</p>
          <div className="space-y-4">
            {analytics.topStock.map((product) => (
              <div key={product.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{product.name}</span>
                  <span>{product.stock_quantity}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-zinc-950" style={{ width: `${(product.stock_quantity / analytics.maxStock) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-semibold">Low Stock Watchlist</h2>
          <p className="mb-4 text-sm text-zinc-500">Products needing attention soon.</p>
          <div className="space-y-3">
            {analytics.lowStock.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div>
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-zinc-500">{product.sku} · threshold {product.low_stock_threshold}</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-bold ${product.stock_quantity <= 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{product.stock_quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2"><Clock size={19} /><h2 className="text-lg font-semibold">Recent Orders</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead><tr className="border-b border-zinc-100 text-left text-xs uppercase text-zinc-500"><th className="py-2">Order</th><th>Status</th><th>Total</th><th>Created</th></tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {analytics.recentOrders.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="py-3 font-semibold">{order.order_number}</td>
                    <td><span className={`rounded-md px-2 py-1 text-xs font-semibold text-white ${statusColors[order.status]}`}>{order.status}</span></td>
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td className="text-zinc-500">{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-semibold">Recent Inventory Activity</h2>
          <p className="mb-4 text-sm text-zinc-500">Latest stock movements.</p>
          <div className="space-y-3">
            {analytics.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-lg border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold capitalize">{transaction.type.replaceAll("_", " ")}</p>
                  <span className={`text-sm font-bold ${transaction.quantity < 0 ? "text-rose-700" : "text-teal-700"}`}>{transaction.quantity > 0 ? "+" : ""}{transaction.quantity}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{transaction.note || "No note"} · {new Date(transaction.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function MetricCard({ label, value, icon: Icon, accent, sub }) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <div className={`rounded-lg bg-zinc-100 p-2 ${accent}`}><Icon size={22} /></div>
      </div>
      <p className="mt-4 text-xs text-zinc-500">{sub}</p>
    </div>
  );
}

function HealthRow({ icon: Icon, label, value, tone }) {
  const colors = {
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    teal: "bg-teal-50 text-teal-700 border-teal-100",
  };
  return (
    <div className={`flex items-center justify-between rounded-lg border p-4 ${colors[tone]}`}>
      <div className="flex items-center gap-3"><Icon size={20} /><span className="text-sm font-semibold">{label}</span></div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
