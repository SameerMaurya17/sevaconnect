import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { errorMessage } from "../api";
import Alert from "../components/Alert";
import { btnPrimary, card, input, label } from "../ui";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(errorMessage(err, "Could not log in. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <h1 className="mb-1 text-3xl font-bold text-emerald-800">SevaConnect</h1>
      <p className="mb-6 text-slate-600">SevaDeep Foundation volunteer management</p>

      <form onSubmit={handleSubmit} className={card}>
        <h2 className="mb-4 text-xl font-semibold">Log in</h2>
        <Alert>{error}</Alert>

        <div className="mb-4">
          <label className={label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            className={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-5">
          <label className={label} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            className={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
          {busy ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          New volunteer?{" "}
          <Link to="/register" className="font-medium text-emerald-700 underline">
            Create an account
          </Link>
        </p>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        Demo admin: admin@seva.org / admin123. Demo volunteer: priya@seva.org / volunteer123
      </p>
    </div>
  );
}
