import { Filter, PackageCheck, RotateCcw, Search, ShoppingCart, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import AuthPrompt from "../components/AuthPrompt.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fetchProducts } from "../store/slices/productsSlice.js";
import { addCartItem } from "../store/slices/cartSlice.js";
import { formatCurrency } from "../utils/currency.js";
import { getProductImage, getStockMeta, handleProductImageError, stockBadgeClass } from "../utils/productVisuals.js";

const DEFAULT_FILTERS = {
  search: "",
  category: "all",
  stock: "all",
  price: "all",
  sort: "featured",
};

export default function Products() {
  const dispatch = useDispatch();
  const { items: products, lastFetchedAt } = useSelector((state) => state.products);
  const user = useSelector((state) => state.auth.user);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    const timer = window.setInterval(() => dispatch(fetchProducts()), 12000);
    return () => window.clearInterval(timer);
  }, [dispatch]);

  const categories = useMemo(() => ["all", ...new Set(products.map((product) => product.category))], [products]);

  const filteredProducts = useMemo(() => {
    const visible = products.filter((product) => {
      const stock = getStockMeta(product);
      const price = Number(product.price || 0);
      const matchesSearch = `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === "all" || product.category === filters.category;
      const matchesStock =
        filters.stock === "all" ||
        (filters.stock === "available" && !stock.isOutOfStock) ||
        (filters.stock === "low" && !stock.isOutOfStock && product.stock_quantity <= product.low_stock_threshold) ||
        (filters.stock === "out" && stock.isOutOfStock);
      const matchesPrice =
        filters.price === "all" ||
        (filters.price === "under25" && price < 25) ||
        (filters.price === "25to75" && price >= 25 && price <= 75) ||
        (filters.price === "over75" && price > 75);
      return matchesSearch && matchesCategory && matchesStock && matchesPrice;
    });

    return [...visible].sort((a, b) => {
      if (filters.sort === "price_low") return Number(a.price) - Number(b.price);
      if (filters.sort === "price_high") return Number(b.price) - Number(a.price);
      if (filters.sort === "stock_high") return Number(b.stock_quantity) - Number(a.stock_quantity);
      if (filters.sort === "stock_low") return Number(a.stock_quantity) - Number(b.stock_quantity);
      if (filters.sort === "name") return a.name.localeCompare(b.name);
      return Number(b.stock_quantity > 0) - Number(a.stock_quantity > 0);
    });
  }, [products, filters]);

  const availableCount = products.filter((product) => product.stock_quantity > 0 && product.status !== "out_of_stock").length;
  const outOfStockCount = products.filter((product) => getStockMeta(product).isOutOfStock).length;
  const lowStockCount = products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold).length;
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => value !== DEFAULT_FILTERS[key]).length;

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const add = async (product) => {
    if (user?.role !== "customer") {
      toast("Login to unlock cart and 10% off.");
      setAuthOpen(true);
      return;
    }
    await dispatch(addCartItem({ product_id: product.id, quantity: 1 })).unwrap();
    toast.success(`${product.name} added to cart.`);
    dispatch(fetchProducts());
  };

  return (
    <>
      <AuthPrompt open={authOpen} onClose={() => setAuthOpen(false)} title="Login to add to cart" message="Create an account or sign in to unlock cart, checkout, and 10% off your first order." />
      <PageHeader title="Products" subtitle="Live inventory refreshes automatically while you shop." />

      <section className="accent-band mb-5 grid gap-4 rounded-lg p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-white p-2 shadow-sm"><Sparkles size={20} /></div>
          <div>
            <p className="text-sm font-semibold">Fresh stock view</p>
            <p className="text-xs text-teal-800">Last synced {lastFetchedAt ? new Date(lastFetchedAt).toLocaleTimeString() : "just now"}</p>
          </div>
        </div>
        <div className="text-sm"><strong>{availableCount}</strong> available</div>
        <div className="text-sm"><strong>{lowStockCount}</strong> low-stock</div>
        <div className="text-sm"><strong>{outOfStockCount}</strong> sold out</div>
      </section>
      {!user && (
        <section className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm font-semibold">Limited offer: Login and get 10% off your first order.</p>
          <p className="mt-1 text-xs">Browse freely. We will ask you to login only when you add to cart, checkout, or view your account.</p>
        </section>
      )}

      <section className="panel mb-5 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><Filter size={17} /> Filters and sorting</div>
          <button className="btn-secondary py-1.5" disabled={!activeFilterCount} onClick={() => setFilters(DEFAULT_FILTERS)}><RotateCcw size={15} /> Clear {activeFilterCount ? `(${activeFilterCount})` : ""}</button>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(150px,1fr))]">
          <label className="search-field">
            <Search className="search-icon" size={18} />
            <input className="input search-input" placeholder="Search products, SKUs, categories" value={filters.search} onChange={(event) => setFilter("search", event.target.value)} />
          </label>
          <select className="input" value={filters.category} onChange={(event) => setFilter("category", event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item === "all" ? "All categories" : item}</option>)}
          </select>
          <select className="input" value={filters.stock} onChange={(event) => setFilter("stock", event.target.value)}>
            <option value="all">All stock</option>
            <option value="available">Available only</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select className="input" value={filters.price} onChange={(event) => setFilter("price", event.target.value)}>
            <option value="all">All prices</option>
            <option value="under25">Under {formatCurrency(25)}</option>
            <option value="25to75">{formatCurrency(25)} to {formatCurrency(75)}</option>
            <option value="over75">Over {formatCurrency(75)}</option>
          </select>
          <select className="input" value={filters.sort} onChange={(event) => setFilter("sort", event.target.value)}>
            <option value="featured">Featured</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
            <option value="stock_high">Stock: high to low</option>
            <option value="stock_low">Stock: low to high</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Showing {filteredProducts.length} of {products.length} products</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const stock = getStockMeta(product);

          return (
            <article key={product.id} className={`panel group relative flex flex-col overflow-hidden transition ${stock.isOutOfStock ? "border-2 border-rose-600 bg-zinc-300 shadow-[0_18px_40px_rgba(225,29,72,0.2)]" : "hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"}`}>
              {stock.isOutOfStock && <div className="h-2 w-full bg-rose-600" />}
              {stock.isOutOfStock && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
                  <div className="w-[150%] -rotate-12 bg-rose-600 py-4 text-center text-base font-black uppercase tracking-[0.4em] text-white shadow-[0_12px_30px_rgba(190,18,60,0.45)] ring-4 ring-rose-200">Out of stock</div>
                </div>
              )}
              {stock.isOutOfStock && <div className="pointer-events-none absolute inset-0 z-10 bg-rose-100/25" />}
              <Link to={`/product/${product.id}`} className={`relative block overflow-hidden ${stock.isOutOfStock ? "bg-zinc-300" : "bg-zinc-100"}`}>
                <img src={getProductImage(product)} alt={product.name} onError={(event) => handleProductImageError(event, product)} className={`h-48 w-full object-cover transition duration-500 ${stock.isOutOfStock ? "opacity-30 saturate-0" : "group-hover:scale-105"}`} />
                <span className={`absolute left-3 top-3 rounded-md border px-2 py-1 text-xs font-semibold ${stock.isOutOfStock ? "border-rose-300 bg-rose-600 text-white shadow-sm" : stockBadgeClass(stock.tone)}`}>{stock.label}</span>
              </Link>
              <div className={`flex flex-1 flex-col p-4 ${stock.isOutOfStock ? "bg-zinc-300" : ""}`}>
                <Link to={`/product/${product.id}`} className={`text-lg font-semibold ${stock.isOutOfStock ? "text-rose-700" : "hover:text-teal-800"}`}>{product.name}</Link>
                <p className={`mt-1 text-sm ${stock.isOutOfStock ? "text-zinc-700" : "text-zinc-500"}`}>{product.category} - {product.sku}</p>
                <p className={`mt-3 line-clamp-2 text-sm leading-6 ${stock.isOutOfStock ? "text-zinc-700" : "text-zinc-600"}`}>{product.description}</p>
                <div className="mt-auto flex items-end justify-between pt-4">
                  <div>
                    <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                    <p className={`flex items-center gap-1 text-xs ${stock.isOutOfStock ? "font-semibold text-rose-700" : "text-zinc-500"}`}><PackageCheck size={14} /> Real-time qty: {product.stock_quantity}</p>
                  </div>
                  <button className={stock.isOutOfStock ? "inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white opacity-90" : "btn"} disabled={stock.isOutOfStock} onClick={() => add(product)}>
                    <ShoppingCart size={16} /> {stock.isOutOfStock ? "Sold out" : "Add"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
