import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import AdminEvents from "./pages/AdminEvents";
import Matcher from "./pages/Matcher";
import Attendance from "./pages/Attendance";

// "/" sends each person to their own home page.
function Home() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-center text-slate-500">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin/events" : "/events"} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/events" element={<ProtectedRoute role="VOLUNTEER"><Events /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute role="VOLUNTEER"><Profile /></ProtectedRoute>} />

          <Route path="/admin/events" element={<ProtectedRoute role="ADMIN"><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/matcher" element={<ProtectedRoute role="ADMIN"><Matcher /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute role="ADMIN"><Attendance /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
