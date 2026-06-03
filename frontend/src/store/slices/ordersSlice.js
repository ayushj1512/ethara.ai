import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client.js";

export const fetchOrders = createAsyncThunk("orders/list", async () => (await api.get("/orders")).data);
export const fetchOrder = createAsyncThunk("orders/detail", async (id) => (await api.get(`/orders/${id}`)).data);
export const checkout = createAsyncThunk("orders/checkout", async () => (await api.post("/orders")).data);

const slice = createSlice({
  name: "orders",
  initialState: { items: [], current: null, loading: false },
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
    .addMatcher((action) => action.type.startsWith("orders/") && action.type.endsWith("/pending"), (state) => { state.loading = true; })
    .addMatcher((action) => ["orders/detail/fulfilled", "orders/checkout/fulfilled"].includes(action.type), (state, action) => { state.loading = false; state.current = action.payload; })
    .addMatcher((action) => action.type.startsWith("orders/") && action.type.endsWith("/rejected"), (state) => { state.loading = false; }),
});
export default slice.reducer;
