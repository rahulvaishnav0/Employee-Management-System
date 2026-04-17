import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function RequireAuth() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}

export function RequireRole({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

