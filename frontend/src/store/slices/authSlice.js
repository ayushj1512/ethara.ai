import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client.js";

const initialState = { token: localStorage.getItem("token"), user: JSON.parse(localStorage.getItem("user") || "null"), sessions: [], loading: false };

export const login = createAsyncThunk("auth/login", async ({ payload, admin = false }) => (await api.post(admin ? "/admin/auth/login" : "/auth/login", payload)).data);
export const signup = createAsyncThunk("auth/signup", async (payload) => (await api.post("/auth/signup", payload)).data);
export const loadMe = createAsyncThunk("auth/me", async (_, { getState }) => {
  const role = getState().auth.user?.role;
  return (await api.get(role === "admin" ? "/admin/auth/me" : "/auth/me")).data;
});
export const logout = createAsyncThunk("auth/logout", async () => (await api.post("/auth/logout")).data);
export const fetchSessions = createAsyncThunk("auth/sessions", async () => (await api.get("/auth/sessions")).data);
export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload) => (await api.patch("/auth/me", payload)).data);

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: { clearAuth(state) { state.token = null; state.user = null; localStorage.clear(); } },
  extraReducers: (builder) => builder
    .addCase(loadMe.fulfilled, (state, action) => { state.user = action.payload; localStorage.setItem("user", JSON.stringify(action.payload)); })
    .addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; localStorage.setItem("user", JSON.stringify(action.payload)); })
    .addCase(fetchSessions.fulfilled, (state, action) => { state.sessions = action.payload; state.loading = false; })
    .addCase(logout.fulfilled, (state) => { state.token = null; state.user = null; localStorage.clear(); })
    .addMatcher((action) => action.type.startsWith("auth/") && action.type.endsWith("/pending"), (state) => { state.loading = true; })
    .addMatcher((action) => ["auth/login/fulfilled", "auth/signup/fulfilled"].includes(action.type), (state, action) => { state.loading = false; state.token = action.payload.access_token; state.user = action.payload.user; localStorage.setItem("token", state.token); localStorage.setItem("user", JSON.stringify(state.user)); })
    .addMatcher((action) => action.type.startsWith("auth/") && action.type.endsWith("/rejected"), (state) => { state.loading = false; }),
});

export const { clearAuth } = slice.actions;
export default slice.reducer;
