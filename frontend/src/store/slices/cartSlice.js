import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client.js";
import { checkout } from "./ordersSlice.js";

export const fetchCart = createAsyncThunk("cart/get", async () => (await api.get("/cart")).data);
export const addCartItem = createAsyncThunk("cart/add", async (payload) => (await api.post("/cart/items", payload)).data);
export const updateCartItem = createAsyncThunk("cart/update", async ({ id, quantity }) => (await api.patch(`/cart/items/${id}`, { quantity })).data);
export const removeCartItem = createAsyncThunk("cart/remove", async (id) => (await api.delete(`/cart/items/${id}`)).data);
export const clearCart = createAsyncThunk("cart/clear", async () => (await api.delete("/cart/clear")).data);
export const applyCartOffer = createAsyncThunk("cart/applyOffer", async () => (await api.post("/cart/offer")).data);

const slice = createSlice({
  name: "cart",
  initialState: { data: { id: null, customer_id: null, items: [], subtotal_amount: 0, discount_rate: 0, discount_amount: 0, discount_applied: false, total_amount: 0 }, loading: false, lastFetchedAt: null },
  reducers: {
    resetCart(state) {
      state.data = { id: null, customer_id: null, items: [], subtotal_amount: 0, discount_rate: 0, discount_amount: 0, discount_applied: false, total_amount: 0 };
      state.loading = false;
    },
  },
  extraReducers: (builder) => builder
    .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; state.lastFetchedAt = Date.now(); })
    .addCase(addCartItem.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; state.lastFetchedAt = Date.now(); })
    .addCase(updateCartItem.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; state.lastFetchedAt = Date.now(); })
    .addCase(removeCartItem.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; state.lastFetchedAt = Date.now(); })
    .addCase(clearCart.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; state.lastFetchedAt = Date.now(); })
    .addCase(applyCartOffer.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; state.lastFetchedAt = Date.now(); })
    .addCase(checkout.fulfilled, (state) => {
      state.data = { id: state.data?.id ?? null, customer_id: state.data?.customer_id ?? null, items: [], subtotal_amount: 0, discount_rate: 0, discount_amount: 0, discount_applied: false, total_amount: 0 };
      state.loading = false;
    })
    .addMatcher((action) => action.type.startsWith("cart/") && action.type.endsWith("/pending"), (state) => { state.loading = true; })
    .addMatcher((action) => action.type.startsWith("cart/") && action.type.endsWith("/rejected"), (state) => { state.loading = false; }),
});
export const { resetCart } = slice.actions;
export default slice.reducer;
