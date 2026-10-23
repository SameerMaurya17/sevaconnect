import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { errorMessage } from "../api";
import Alert from "../components/Alert";
import { btnPrimary, card, input, label } from "../ui";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/profile"); // let new volunteers add skills right away
    } catch (err) {
      setError(errorMessage(err, "Could not create the account. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <h1 className="mb-1 text-3xl font-bold text-emerald-800">Join SevaConnect</h1>
      <p className="mb-6 text-slate-600">Create a volunteer account</p>

      <form onSubmit={handleSubmit} className={card}>
        <Alert>{error}</Alert>

        <div className="mb-4">
          <label className={label} htmlFor="name">Full name</label>
          <input id="name" required className={input} value={form.name} onChange={update("name")} />
        </div>
        <div className="mb-4">
          <label className={label} htmlFor="email">Email</label>
          <input id="email" type="email" required className={input} value={form.email} onChange={update("email")} />
        </div>
        <div className="mb-4">
          <label className={label} htmlFor="phone">Phone (optional)</label>
          <input id="phone" className={input} value={form.phone} onChange={update("phone")} />
        </div>
        <div className="mb-5">
          <label className={label} htmlFor="password">Password (at least 6 characters)</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className={input}
            value={form.password}
            onChange={update("password")}
          />
        </div>

        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
          {busy ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="font-medium text-emerald-700 underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
