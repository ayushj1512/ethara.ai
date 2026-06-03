import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./routes/App.jsx";
import { store } from "./store/store.js";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
            color: "#18181b",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#0f766e", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#be123c", secondary: "#ffffff" } },
        }}
      />
    </Provider>
  </React.StrictMode>
);
