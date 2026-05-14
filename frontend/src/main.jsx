import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "font-sans",
          style: {
            background: "rgba(15, 23, 42, 0.92)",
            color: "#f8fafc",
            borderRadius: "14px",
            fontSize: "14px",
            border: "1px solid rgba(45, 212, 191, 0.25)",
            boxShadow: "0 12px 40px -8px rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
          },
          success: {
            iconTheme: { primary: "#2dd4bf", secondary: "#0f172a" },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "#0f172a" },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
