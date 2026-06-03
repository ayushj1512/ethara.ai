import { Minus, PackageCheck, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import AuthPrompt from "../components/AuthPrompt.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fetchProduct, fetchProducts } from "../store/slices/productsSlice.js";
import { addCartItem } from "../store/slices/cartSlice.js";
import { formatCurrency } from "../utils/currency.js";
import { getProductImage, getStockMeta, handleProductImageError, stockBadgeClass } from "../utils/productVisuals.js";

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.current);
  const user = useSelector((state) => state.auth.user);
  const [quantity, setQuantity] = useState(1);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    const timer = window.setInterval(() => dispatch(fetchProduct(id)), 12000);
    return () => window.clearInterval(timer);
  }, [dispatch, id]);

  if (!product) return null;

  const stock = getStockMeta(product);
  const maxQuantity = Math.max(1, Number(product.stock_quantity || 0));
  const changeQuantity = (nextQuantity) => setQuantity(Math.min(maxQuantity, Math.max(1, nextQuantity)));
  const add = async () => {
    if (user?.role !== "customer") {
      toast("Login to unlock cart and 10% off.");
      setAuthOpen(true);
      return;
    }
    await dispatch(addCartItem({ product_id: product.id, quantity })).unwrap();
    toast.success(`${quantity} ${product.name} added.`);
    dispatch(fetchProduct(id));
    dispatch(fetchProducts());
  };

  return (
    <>
      <AuthPrompt open={authOpen} onClose={() => setAuthOpen(false)} title="Login to add to cart" message="Sign in to continue shopping and claim 10% off your first order." />
      <PageHeader title={product.name} subtitle={`${product.category} - ${product.sku}`} />
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className={`relative overflow-hidden rounded-lg ${stock.isOutOfStock ? "border-2 border-rose-600 bg-zinc-300" : "bg-zinc-100"}`}>
          {stock.isOutOfStock && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
              <div className="w-[150%] -rotate-12 bg-rose-600 py-4 text-center text-base font-black uppercase tracking-[0.4em] text-white shadow-[0_12px_30px_rgba(190,18,60,0.45)] ring-4 ring-rose-200">Out of stock</div>
            </div>
          )}
          <img src={getProductImage(product)} alt={product.name} onError={(event) => handleProductImageError(event, product)} className={`h-[520px] w-full object-cover ${stock.isOutOfStock ? "opacity-35 saturate-0" : ""}`} />
          <span className={`absolute left-4 top-4 rounded-md border px-3 py-1.5 text-sm font-semibold ${stock.isOutOfStock ? "border-rose-300 bg-rose-600 text-white" : stockBadgeClass(stock.tone)}`}>{stock.label}</span>
        </div>
        <div className={`panel h-fit p-5 ${stock.isOutOfStock ? "border-2 border-rose-600 bg-zinc-300" : ""}`}>
          <p className={`text-sm leading-6 ${stock.isOutOfStock ? "text-zinc-700" : "text-zinc-600"}`}>{product.description}</p>
          <div className="my-5 grid grid-cols-2 gap-3 border-y border-zinc-100 py-4">
            <div>
              <p className="text-xs uppercase text-zinc-400">Price</p>
              <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-400">Live quantity</p>
              <p className={`flex items-center gap-2 text-2xl font-semibold ${stock.isOutOfStock ? "text-rose-700" : ""}`}><PackageCheck size={20} /> {product.stock_quantity}</p>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-2">
            <button className="btn-secondary px-3" disabled={stock.isOutOfStock || quantity <= 1} onClick={() => changeQuantity(quantity - 1)}><Minus size={16} /></button>
            <span className="text-sm font-semibold">{stock.isOutOfStock ? "Unavailable" : `Qty ${quantity}`}</span>
            <button className="btn-secondary px-3" disabled={stock.isOutOfStock || quantity >= product.stock_quantity} onClick={() => changeQuantity(quantity + 1)}><Plus size={16} /></button>
          </div>

          <button className={stock.isOutOfStock ? "inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white opacity-90" : "btn w-full"} disabled={stock.isOutOfStock} onClick={add}>
            <ShoppingCart size={16} /> {stock.isOutOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </section>
    </>
  );
}
