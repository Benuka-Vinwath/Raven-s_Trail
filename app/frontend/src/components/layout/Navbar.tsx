import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import RavenMark from "../icons/RavenMark";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { to: "/trails", label: "Trails" },
  { to: "/rentals", label: "Gear rental" },
  { to: "/parking", label: "Parking" },
  { to: "/budget", label: "Budget planner" },
  { to: "/weather", label: "Weather" },
  { to: "/community", label: "Community" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-parchment-50/55 backdrop-blur-xl backdrop-saturate-150 border-b border-white/40 shadow-[0_1px_24px_-4px_rgba(14,28,21,0.12)] supports-[backdrop-filter]:bg-parchment-50/40">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <motion.span
            className="text-forest-600 flex"
            whileHover={{ rotate: -12, scale: 1.12 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <RavenMark className="h-6 w-6" />
          </motion.span>
          <span className="font-display text-lg text-ink-900">Raven's Trail</span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={clsx(
                  "relative py-1.5 text-sm font-medium transition-colors duration-200 ease-smooth",
                  isActive ? "text-clay-600" : "text-ink-700/80 hover:text-ink-900"
                )}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-clay-600 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-ink-700/80">
                Hi, <span className="font-medium text-ink-900">{user.name.split(" ")[0]}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={14} />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button to="/signup" variant="primary" size="sm">
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-ink-900"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "open"}
              className="flex"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-menu"
            className="lg:hidden border-t border-white/40 bg-parchment-50/70 backdrop-blur-xl backdrop-saturate-150 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "py-2.5 text-[0.95rem] font-medium border-b border-ink-900/5 transition-colors duration-200 ease-smooth",
                      isActive ? "text-clay-600" : "text-ink-700"
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-ink-700/80">
                    Hi, <span className="font-medium text-ink-900">{user.name.split(" ")[0]}</span>
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut size={14} />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 pt-4">
                  <Button to="/login" variant="ghost" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                    Sign in
                  </Button>
                  <Button to="/signup" variant="primary" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                    Get started
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
