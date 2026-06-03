import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/authSlice.js";
import products from "./slices/productsSlice.js";
import cart from "./slices/cartSlice.js";
import orders from "./slices/ordersSlice.js";
import admin from "./slices/adminSlice.js";

export const store = configureStore({ reducer: { auth, products, cart, orders, admin } });
