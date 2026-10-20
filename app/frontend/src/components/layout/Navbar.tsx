import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import RavenMark from "../icons/RavenMark";
import Avatar from "../ui/Avatar";
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
    <header className="sticky top-3 z-50 mx-3 sm:mx-6 mt-3 rounded-3xl border border-white/15 bg-pine-950/75 text-parchment-50 backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)]">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <motion.span
            className="text-gold-400 flex"
            whileHover={{ rotate: -12, scale: 1.12 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <RavenMark className="h-6 w-6" />
          </motion.span>
          <span className="font-display text-lg">Raven's Trail</span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={clsx(
                  "relative py-1.5 text-sm transition-colors duration-200 ease-smooth",
                  isActive ? "text-white" : "text-white/65 hover:text-white"
                )}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-gold-400 rounded-full"
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
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white" title="Edit profile">
                <Avatar name={user.name} src={user.avatarUrl} className="h-7 w-7 text-xs" />
                Hi, <span className="font-medium text-white">{user.name.split(" ")[0]}</span>
              </Link>
              <Button variant="glass" size="sm" onClick={handleLogout}>
                <LogOut size={14} />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="glass" size="sm">
                Sign in
              </Button>
              <Button to="/signup" variant="light" size="sm">
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 -mr-2"
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
            className="lg:hidden border-t border-white/15 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="px-5 py-4 flex flex-col gap-1">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "py-2.5 text-[0.95rem] border-b border-white/10 transition-colors duration-200 ease-smooth",
                      isActive ? "text-gold-400" : "text-white/80"
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <div className="flex items-center justify-between pt-4">
                  <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white" title="Edit profile">
                <Avatar name={user.name} src={user.avatarUrl} className="h-7 w-7 text-xs" />
                    Hi, <span className="font-medium text-white">{user.name.split(" ")[0]}</span>
                  </Link>
                  <Button variant="glass" size="sm" onClick={handleLogout}>
                    <LogOut size={14} />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 pt-4">
                  <Button to="/login" variant="glass" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                    Sign in
                  </Button>
                  <Button to="/signup" variant="light" size="sm" className="flex-1" onClick={() => setOpen(false)}>
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
