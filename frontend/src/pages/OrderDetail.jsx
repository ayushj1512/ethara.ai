import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fetchOrder } from "../store/slices/ordersSlice.js";
import { formatCurrency } from "../utils/currency.js";

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const order = useSelector((state) => state.orders.current);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  if (!order) return null;
  const discountPercent = Math.round(Number(order.discount_rate || 0) * 100);
  const shippingAddress = [
    order.shipping_address_line1,
    order.shipping_address_line2,
    order.shipping_city,
    order.shipping_state,
    order.shipping_postal_code,
    order.shipping_country,
  ].filter(Boolean).join(", ");

  return (
    <>
      <PageHeader title={order.order_number} subtitle={`Status: ${order.status} - Total ${formatCurrency(order.total_amount)}`} />
      <section className="panel mb-5 grid gap-4 p-4 md:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-xs uppercase text-zinc-400">Ship to</p>
          <p className="mt-1 font-semibold">{order.shipping_name || "Customer"}</p>
          <p className="text-sm text-zinc-500">{order.shipping_phone || "No phone recorded"}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-zinc-400">Shipping address</p>
          <p className="mt-1 text-sm font-medium text-zinc-800">{shippingAddress || "No address recorded"}</p>
        </div>
      </section>
      <section className="panel mb-5 grid gap-3 p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-zinc-500">Subtotal</p>
          <p className="mt-1 text-lg font-semibold">{formatCurrency(order.subtotal_amount)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Offer discount {discountPercent}%</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">-{formatCurrency(order.discount_amount)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Paid total</p>
          <p className="mt-1 text-lg font-semibold">{formatCurrency(order.total_amount)}</p>
        </div>
      </section>
      <DataTable
        rows={order.items || []}
        columns={[
          { key: "product_name", label: "Product" },
          { key: "category", label: "Category", render: (row) => row.product?.category || "-" },
          { key: "sku", label: "SKU" },
          { key: "quantity", label: "Qty" },
          { key: "unit_price", label: "Price", render: (row) => formatCurrency(row.unit_price) },
          { key: "line_total", label: "Total", render: (row) => formatCurrency(row.line_total) },
        ]}
      />
    </>
  );
}
