import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client.js";

export const fetchStats = createAsyncThunk("admin/stats", async () => (await api.get("/admin/dashboard/stats")).data);
export const fetchAdminProducts = createAsyncThunk("admin/products", async () => (await api.get("/admin/products")).data);
export const saveProduct = createAsyncThunk("admin/saveProduct", async (payload) => payload.id ? (await api.put(`/admin/products/${payload.id}`, payload)).data : (await api.post("/admin/products", payload)).data);
export const deleteProduct = createAsyncThunk("admin/deleteProduct", async (id) => { await api.delete(`/admin/products/${id}`); return id; });
export const updateStock = createAsyncThunk("admin/updateStock", async ({ id, payload }) => (await api.patch(`/admin/products/${id}/stock`, payload)).data);
export const fetchAdminOrders = createAsyncThunk("admin/orders", async () => (await api.get("/admin/orders")).data);
export const updateOrderStatus = createAsyncThunk("admin/orderStatus", async ({ id, status }) => (await api.patch(`/admin/orders/${id}/status`, { status })).data);
export const fetchCustomers = createAsyncThunk("admin/customers", async () => (await api.get("/admin/customers")).data);
export const resetCustomerPassword = createAsyncThunk("admin/resetCustomerPassword", async ({ id, new_password }) => (await api.patch(`/admin/customers/${id}/password`, { new_password })).data);
export const fetchTransactions = createAsyncThunk("admin/transactions", async () => (await api.get("/admin/inventory/transactions")).data);

const slice = createSlice({
  name: "admin",
  initialState: { stats: null, products: [], orders: [], customers: [], transactions: [], loading: false },
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchStats.fulfilled, (state, action) => { state.stats = action.payload; state.loading = false; })
    .addCase(fetchAdminProducts.fulfilled, (state, action) => { state.products = action.payload; state.loading = false; })
    .addCase(fetchAdminOrders.fulfilled, (state, action) => { state.orders = action.payload; state.loading = false; })
    .addCase(fetchCustomers.fulfilled, (state, action) => { state.customers = action.payload; state.loading = false; })
    .addCase(resetCustomerPassword.fulfilled, (state, action) => {
      state.customers = state.customers.map((customer) => customer.id === action.payload.id ? action.payload : customer);
      state.loading = false;
    })
    .addCase(fetchTransactions.fulfilled, (state, action) => { state.transactions = action.payload; state.loading = false; })
    .addMatcher((action) => action.type.startsWith("admin/") && action.type.endsWith("/pending"), (state) => { state.loading = true; })
    .addMatcher((action) => action.type.startsWith("admin/") && action.type.endsWith("/fulfilled"), (state) => { state.loading = false; })
    .addMatcher((action) => action.type.startsWith("admin/") && action.type.endsWith("/rejected"), (state) => { state.loading = false; }),
});
export default slice.reducer;
