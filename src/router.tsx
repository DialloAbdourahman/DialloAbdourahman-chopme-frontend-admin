import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import CreateRestaurant from "./pages/CreateRestaurant";
import RestaurantDetails from "./pages/RestaurantDetails";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import WebSocket from "./components/WebSocket";
import Footer from "./components/Footer";
import { EnumUserRole } from "chopme-frontend-common";
import Navbar from "./components/Navbar";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useSelector((state: RootState) => state.user);
  const location = useLocation();
  const redirectUrl = encodeURIComponent(location.pathname + location.search);
  return user && user.role === EnumUserRole.ADMIN ? (
    <>{children}</>
  ) : (
    <Navigate to={`/signin?redirect_url=${redirectUrl}`} replace />
  );
};

const AppContent = () => {
  const { pathname } = useLocation();
  const isSignin = pathname === "/signin";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WebSocket />
      {!isSignin && <Navbar />}
      <main className="flex-1">
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
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <Restaurants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/create"
            element={
              <ProtectedRoute>
                <CreateRestaurant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/:id"
            element={
              <ProtectedRoute>
                <RestaurantDetails />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isSignin && <Footer />}
    </div>
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
