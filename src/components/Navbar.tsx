import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ChefHat, Home, Utensils, User, LogOut, Menu, X } from "lucide-react";
import { AuthService } from "../services/auth.service";
import { TokensService } from "../services/tokens.service";
import { KEYS } from "../utils/keys";
import { setUser } from "../store/user.slice";
import type { RootState } from "../store";

const Navbar = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.user);

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Restaurants", href: "/restaurants", icon: Utensils },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const handleLogout = async () => {
    try {
      const refreshToken = TokensService.getToken(KEYS.REFRESH_TOKEN_KEY);
      await AuthService.logout(refreshToken ?? undefined);
      TokensService.removeToken(KEYS.ACCESS_TOKEN_KEY);
      TokensService.removeToken(KEYS.REFRESH_TOKEN_KEY);
      dispatch(setUser(null));
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <>
      <nav className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-xl p-2">
              <ChefHat size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-text tracking-tight">
              ChopMe
            </span>
            <span className="text-xs font-semibold text-white bg-primary/80 rounded-full px-2 py-0.5">
              Admin
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-gray-500 hover:text-primary"
                  }`
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-red-600"
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="p-2 text-text"
              aria-label="Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-border px-4 pb-4 bg-card">
            <div className="flex flex-col gap-3 pt-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-gray-500 hover:text-primary"
                    }`
                  }
                >
                  <link.icon size={18} />
                  {link.label}
                </NavLink>
              ))}
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
