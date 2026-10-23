import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// role = "ADMIN" or "VOLUNTEER"
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
