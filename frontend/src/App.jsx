import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { EmployeeDashboard } from "./pages/EmployeeDashboard";
import { HrDashboard } from "./pages/HrDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { RequireAuth, RequireRole } from "./routes/RequireAuth";
import { useAuth } from "./auth/AuthContext";

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-full">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === "admin" ? "/admin" : user.role === "hr" ? "/hr" : "/employee"} /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to={user.role === "admin" ? "/admin" : user.role === "hr" ? "/hr" : "/employee"} /> : <RegisterPage />}
        />

        <Route element={<RequireAuth />}>
          <Route element={<RequireRole roles={["employee"]} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
          </Route>
          <Route element={<RequireRole roles={["hr"]} />}>
            <Route path="/hr" element={<HrDashboard />} />
          </Route>
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
