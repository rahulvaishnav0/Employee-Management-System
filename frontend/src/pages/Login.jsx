import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-2xl font-semibold">Login</div>
        <p className="mt-1 text-sm text-slate-600">Welcome back.</p>
        {/* <div className="mt-2 text-xs text-slate-500">API: {api.defaults.baseURL}</div> */}

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);
            try {
              const u = await login(email, password);
              navigate(u.role === "admin" ? "/admin" : u.role === "hr" ? "/hr" : "/employee");
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error("login_error", err);
              const status = err?.response?.status;
              const serverMsg = err?.response?.data?.message;
              const fallbackMsg = err?.message || "Login failed";
              setError(
                serverMsg
                  ? `(${status}) ${serverMsg}`
                  : status
                    ? `(${status}) ${fallbackMsg}`
                    : `Network: ${fallbackMsg}`
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={busy}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          New user?{" "}
          <Link className="font-medium text-slate-900 underline" to="/register">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

