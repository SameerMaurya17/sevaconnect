import { createContext, useContext, useEffect, useState } from "react";
import api, { TOKEN_KEY } from "./api";

const AuthContext = createContext(null);

function toBase64(text) {
  // UTF-8 safe btoa
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session after a page refresh.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    localStorage.setItem(TOKEN_KEY, toBase64(`${email.trim().toLowerCase()}:${password}`));
    try {
      const res = await api.get("/api/me"); // fails with 401 if the credentials are wrong
      setUser(res.data);
      return res.data;
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      throw err;
    }
  };

  const register = async ({ name, email, phone, password }) => {
    localStorage.removeItem(TOKEN_KEY);
    await api.post("/api/auth/register", { name, email, phone, password });
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
