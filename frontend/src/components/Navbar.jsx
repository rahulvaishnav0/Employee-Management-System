import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold">
          EMS
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-sm text-slate-600 sm:block">
                {user.name} • {user.role}
              </div>
              <button
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="text-sm font-medium text-slate-700" to="/login">
                Login
              </Link>
              <Link
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                to="/register"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

