import { BadgePercent, MapPin, Minus, PackageCheck, Phone, Plus, ShoppingBag, Sparkles, Trash2, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import { applyCartOffer, fetchCart, removeCartItem, updateCartItem } from "../store/slices/cartSlice.js";
import { checkout } from "../store/slices/ordersSlice.js";
import { formatCurrency } from "../utils/currency.js";
import { getProductImage, getStockMeta, handleProductImageError, stockBadgeClass } from "../utils/productVisuals.js";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: cart, lastFetchedAt } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchCart());
    const timer = window.setInterval(() => dispatch(fetchCart()), 10000);
    return () => window.clearInterval(timer);
  }, [dispatch]);

  const setQuantity = async (row, quantity) => {
    const nextQuantity = Math.min(Number(row.product.stock_quantity || 1), Math.max(1, quantity));
    await dispatch(updateCartItem({ id: row.id, quantity: nextQuantity })).unwrap();
    toast.success("Cart quantity updated.");
  };

  const remove = async (row) => {
    await dispatch(removeCartItem(row.id)).unwrap();
    toast.success(`${row.product.name} removed.`);
  };

  const placeOrder = async () => {
    if (!hasAddress) {
      toast.error("Add your shipping address before checkout.");
      navigate("/profile");
      return;
    }
    const order = await dispatch(checkout()).unwrap();
    toast.success("Order placed.");
    navigate(`/orders/${order.id}`);
  };

  const applyOffer = async () => {
    await dispatch(applyCartOffer()).unwrap();
    toast.success("10% offer applied. Price updated.");
  };

  const items = cart?.items || [];
  const discountPercent = Math.round(Number(cart?.discount_rate || 0.1) * 100);
  const offerApplied = Boolean(cart?.discount_applied);
  const addressParts = [user?.address_line1, user?.address_line2, user?.city, user?.state, user?.postal_code, user?.country].filter(Boolean);
  const hasAddress = Boolean(user?.address_line1 && user?.city && user?.state && user?.postal_code && user?.country);

  return (
    <>
      <PageHeader
        title="Cart"
        subtitle={`Stock is checked before checkout. Last synced ${lastFetchedAt ? new Date(lastFetchedAt).toLocaleTimeString() : "just now"}.`}
        action={<button className="btn" disabled={!items.length} onClick={placeOrder}><ShoppingBag size={16} /> Checkout {formatCurrency(cart?.total_amount)}</button>}
      />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-3">
          {items.length === 0 ? (
            <div className="panel p-8 text-center">
              <ShoppingBag className="mx-auto text-zinc-400" size={34} />
              <p className="mt-3 font-semibold">Your cart is empty.</p>
              <p className="mt-1 text-sm text-zinc-500">Add products to see live quantities and checkout totals here.</p>
            </div>
          ) : items.map((row) => {
            const stock = getStockMeta(row.product);
            const canIncrease = row.quantity < row.product.stock_quantity;

            return (
              <article key={row.id} className="panel grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto]">
                <img src={getProductImage(row.product)} alt={row.product.name} onError={(event) => handleProductImageError(event, row.product)} className="h-28 w-full rounded-md object-cover sm:w-28" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{row.product.name}</h2>
                    <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${stockBadgeClass(stock.tone)}`}>{stock.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{row.product.category} - {row.product.sku}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-zinc-600"><PackageCheck size={16} /> Real-time available qty: {row.product.stock_quantity}</p>
                  <div className="mt-3 flex w-fit items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                    <button className="btn-secondary px-3 py-1.5" disabled={row.quantity <= 1} onClick={() => setQuantity(row, row.quantity - 1)}><Minus size={15} /></button>
                    <span className="min-w-12 text-center text-sm font-semibold">{row.quantity}</span>
                    <button className="btn-secondary px-3 py-1.5" disabled={!canIncrease} onClick={() => setQuantity(row, row.quantity + 1)}><Plus size={15} /></button>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">{formatCurrency(row.unit_price)} each</p>
                    <p className="text-lg font-semibold">{formatCurrency(row.line_total)}</p>
                  </div>
                  <button className="btn-secondary" onClick={() => remove(row)}><Trash2 size={16} /> Remove</button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="panel h-fit p-5">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className={`mt-4 rounded-lg border p-4 ${hasAddress ? "border-zinc-200 bg-zinc-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin size={18} className={hasAddress ? "text-teal-700" : "text-amber-700"} />
                <p className="text-sm font-semibold">Shipping address</p>
              </div>
              <button className="btn-secondary py-1.5" type="button" onClick={() => navigate("/profile")}>{hasAddress ? "Edit" : "Add"}</button>
            </div>
            {hasAddress ? (
              <div className="grid gap-2 text-sm">
                <p className="flex items-center gap-2 font-semibold text-zinc-900"><UserRound size={15} /> {user?.full_name}</p>
                <p className="flex items-center gap-2 text-zinc-600"><Phone size={15} /> {user?.phone || "Phone not added"}</p>
                <p className="leading-6 text-zinc-700">{addressParts.join(", ")}</p>
              </div>
            ) : (
              <p className="text-sm leading-6 text-amber-800">Address is required before checkout. Add your full shipping address from profile.</p>
            )}
          </div>
          <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-white p-2 text-teal-700 shadow-sm"><Sparkles size={18} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-teal-900">10% off unlocked</p>
                <p className="mt-1 text-xs text-teal-700">{offerApplied ? "Offer applied to this cart." : "Apply the customer offer before checkout."}</p>
              </div>
              <button className={offerApplied ? "btn-secondary py-1.5" : "btn py-1.5"} disabled={!items.length || offerApplied} onClick={applyOffer}>
                <BadgePercent size={16} /> {offerApplied ? "Applied" : "Apply 10%"}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3 border-y border-zinc-100 py-4 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Items</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Unique products</span><span>{items.length}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Stock checked</span><span>Live</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span>{formatCurrency(cart?.subtotal_amount)}</span></div>
            <div className={`flex justify-between rounded-md px-2 py-1 font-semibold ${offerApplied ? "bg-teal-50 text-teal-700" : "bg-zinc-50 text-zinc-500"}`}><span>Offer discount {offerApplied ? `${discountPercent}%` : "not applied"}</span><span>-{formatCurrency(cart?.discount_amount)}</span></div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Payable total</span>
            <span className="text-2xl font-semibold">{formatCurrency(cart?.total_amount)}</span>
          </div>
          <button className="btn mt-5 w-full" disabled={!items.length} onClick={placeOrder}><ShoppingBag size={16} /> Place order</button>
        </aside>
      </section>
    </>
  );
}
