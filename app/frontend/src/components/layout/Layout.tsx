import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "../chat/Chat.widget";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={location.pathname === "/" ? "flex-1" : "flex-1 surface-light"}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      {/* chat is for logged-in users only; the key remounts it with fresh state when the account changes */}
      {user && <ChatWidget key={user.id} userId={user.id} />}
    </div>
  );
}
