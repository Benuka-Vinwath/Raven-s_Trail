import { Navigate } from "react-router-dom";

// Trips now live in the profile; this keeps old links and bookmarks working.
export default function MyTrips() {
  return <Navigate to="/profile?tab=trips" replace />;
}
