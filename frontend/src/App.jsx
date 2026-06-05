import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Trends from "./pages/Trends";
import Competitors from "./pages/Competitors";
import SavedIdeas from "./pages/SavedIdeas";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AuthModal from "./components/auth/AuthModal";
import { useAuth } from "./context/AuthContext";
import Payment from "./pages/Payment";
import ContentPack from "./pages/ContentPack";

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthModal />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/trends"
          element={
            <ProtectedRoute>
              <Trends />
            </ProtectedRoute>
          }
        />

        <Route
          path="/competitors"
          element={
            <ProtectedRoute>
              <Competitors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-ideas"
          element={
            <ProtectedRoute>
              <SavedIdeas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/content-pack"
          element={
            <ProtectedRoute>
              <ContentPack />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;