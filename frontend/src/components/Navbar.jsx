import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links =
    user.role === "ADMIN"
      ? [
          ["/admin/events", "Manage events"],
          ["/admin/matcher", "Smart matcher"],
          ["/admin/attendance", "Attendance"],
        ]
      : [
          ["/events", "Events"],
          ["/profile", "My profile and hours"],
        ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-lg font-bold text-emerald-800">SevaConnect</span>
          <nav className="flex flex-wrap gap-1">
            {links.map(([to, text]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium ${
                    isActive ? "bg-emerald-100 text-emerald-900" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {text}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">
            {user.name} ({user.role === "ADMIN" ? "Admin" : "Volunteer"})
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
