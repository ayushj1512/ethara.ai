import { Gift, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login, signup } from "../store/slices/authSlice.js";

export default function AuthPrompt({ open, onClose, admin = false, initialSignup = false, title, message }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signupMode, setSignupMode] = useState(initialSignup);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "India" });

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address_line1: form.address_line1.trim() || null,
        address_line2: form.address_line2.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postal_code: form.postal_code.trim() || null,
        country: form.country.trim() || "India",
      };
      const action = signupMode && !admin ? signup(payload) : login({ payload: { email: payload.email, password: form.password }, admin });
      const result = await dispatch(action).unwrap();
      toast.success(signupMode ? "Account created. Offer unlocked." : "Welcome back.");
      if (onClose) onClose();
      navigate(result.user.role === "admin" ? "/admin" : "/products");
    } catch {
      // API client shows the toast.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-sm">
      <div className="panel relative w-full max-w-md overflow-hidden">
        {onClose && <button className="absolute right-3 top-3 z-10 rounded-md bg-white/90 p-2 text-zinc-600 shadow-sm hover:text-zinc-950" onClick={onClose}><X size={18} /></button>}
        <div className="bg-zinc-950 p-5 text-white">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={22} />
            <h1 className="text-xl font-semibold">{title || (admin ? "Admin login" : signupMode ? "Create account" : "Customer login")}</h1>
          </div>
          {!admin && (
            <div className="rounded-lg border border-teal-300/30 bg-teal-400/10 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold"><Gift size={17} /> 10% off your first order</p>
              <p className="mt-1 text-xs text-zinc-300">Sign in to unlock cart, checkout, order tracking, and profile details.</p>
            </div>
          )}
          {message && <p className="mt-3 text-sm text-zinc-300">{message}</p>}
        </div>
        <form onSubmit={submit} className="p-5">
          {signupMode && !admin && <input className="input mb-3" placeholder="Full name" required minLength="2" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />}
          <input className="input mb-3" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {signupMode && !admin && <input className="input mb-3" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}
          {signupMode && !admin && (
            <div className="mb-3 grid gap-3">
              <input className="input" placeholder="Address line 1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
              <input className="input" placeholder="Address line 2" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input className="input" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="input" placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                <input className="input" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
          )}
          <input className="input mb-4" placeholder="Password" type="password" required minLength={signupMode ? 7 : undefined} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn w-full">{signupMode && !admin ? "Create account" : "Login"}</button>
          {!admin && (
            <button type="button" className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-teal-700" onClick={() => setSignupMode(!signupMode)}>
              {signupMode ? "Already have an account? Login" : "New here? Create an account"}
            </button>
          )}
          {admin && <Link to="/products" className="mt-4 block text-center text-sm text-zinc-500 hover:text-teal-700">Back to customer storefront</Link>}
        </form>
      </div>
    </div>
  );
}
