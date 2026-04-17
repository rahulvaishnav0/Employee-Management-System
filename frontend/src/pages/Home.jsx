import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-xl border bg-white p-6 text-left shadow-sm">
        <div className="text-sm font-medium text-slate-500">Employee Management System</div>
        <div className="mt-2 text-3xl font-semibold">Role based dashboards</div>
        <p className="mt-2 text-slate-700">
          Admin, HR, Employee — attendance, leave approvals, and salary management.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {!loading && !user ? (
            <>
              <Link className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" to="/login">
                Login
              </Link>
              <Link className="rounded-md border px-4 py-2 text-sm font-medium" to="/register">
                Register (Employee)
              </Link>
            </>
          ) : null}

          {!loading && user ? (
            <Link
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
              to={user.role === "admin" ? "/admin" : user.role === "hr" ? "/hr" : "/employee"}
            >
              Go to dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

