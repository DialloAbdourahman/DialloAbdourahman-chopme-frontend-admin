import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import WebSocket from "./components/WebSocket";
import Footer from "./components/Footer";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useSelector((state: RootState) => state.user);
  const location = useLocation();
  const redirectUrl = encodeURIComponent(location.pathname + location.search);
  return user ? (
    <>{children}</>
  ) : (
    <Navigate to={`/signin?redirect_url=${redirectUrl}`} replace />
  );
};

const AppContent = () => {
  const { pathname } = useLocation();
  const showFooter = pathname !== "/signin";

  return (
    <>
      <WebSocket />
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
};

const Router = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default Router;
