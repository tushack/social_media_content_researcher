import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { AppAlertProvider } from "./components/ui/AppAlertProvider.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppAlertProvider>
        <App />
      </AppAlertProvider>
    </AuthProvider>
  </React.StrictMode>
);