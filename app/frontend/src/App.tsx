import { Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Trails from "./pages/Trails";
import TrailDetail from "./pages/TrailDetail";
import Rentals from "./pages/Rentals";
import Parking from "./pages/Parking";
import Budget from "./pages/Budget";
import Weather from "./pages/Weather";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import MyTrips from "./pages/MyTrips";
import BookingDetail from "./pages/BookingDetail";
import VoucherPage from "./pages/VoucherPage";
import VerifyPage from "./pages/VerifyPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <MotionConfig reducedMotion="never">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/v/:token" element={<VerifyPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/trails" element={<Trails />} />
          <Route path="/trails/:slug" element={<TrailDetail />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/parking" element={<Parking />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/bookings/:id/voucher" element={<VoucherPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </MotionConfig>
  );
}
