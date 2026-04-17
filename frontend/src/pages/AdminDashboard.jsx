import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function AdminDashboard() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMessage("Admin: you can manage HR + employees + salaries + approvals.");
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="text-2xl font-semibold">Admin Dashboard</div>
      <div className="mt-1 text-sm text-slate-600">Welcome, {user?.name}</div>

      <div className="mt-6 rounded-xl border bg-white p-5">
        <div className="font-semibold">HR Management</div>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-2 text-xs text-slate-500">API: {api.defaults.baseURL}</div>

        {error ? (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setError("");
            setBusy(true);
            try {
              const fd = new FormData(form);
              await api.post("/api/admin/hr", {
                name: String(fd.get("name") || ""),
                email: String(fd.get("email") || ""),
                password: String(fd.get("password") || ""),
              });
              form.reset();
              setMessage("HR created successfully.");
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error("create_hr_error", err);
              const status = err?.response?.status;
              const serverMsg = err?.response?.data?.message;
              const fallbackMsg = err?.message || "Create HR failed";
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
            <label className="text-sm font-medium">Name</label>
            <input required name="name" className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input required name="email" className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Password</label>
            <input
              required
              name="password"
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {busy ? "Creating..." : "Create HR"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Note: Employees, salary, attendance, leaves are available on HR dashboard flows too.
        </div>
      </div>
    </div>
  );
}

