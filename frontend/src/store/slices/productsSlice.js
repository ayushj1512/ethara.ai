import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client.js";

export const fetchProducts = createAsyncThunk("products/list", async () => (await api.get("/products")).data);
export const fetchProduct = createAsyncThunk("products/detail", async (id) => (await api.get(`/products/${id}`)).data);

const slice = createSlice({
  name: "products",
  initialState: { items: [], current: null, loading: false, lastFetchedAt: null },
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchProducts.pending, (state) => { state.loading = true; })
    .addCase(fetchProducts.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; state.lastFetchedAt = Date.now(); })
    .addCase(fetchProduct.fulfilled, (state, action) => { state.current = action.payload; state.lastFetchedAt = Date.now(); })
    .addMatcher((action) => action.type.startsWith("products/") && action.type.endsWith("/rejected"), (state) => { state.loading = false; }),
});
export default slice.reducer;
