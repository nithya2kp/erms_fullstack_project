import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import ManagerDashboard from "./pages/manager/Dashboard";
import Engineers from "./pages/manager/Engineers";
import Projects from "./pages/manager/Projects";
import Assignments from "./pages/manager/Assignments";
import AIMatch from "./pages/manager/AI";
import EngineerDashboard from "./pages/engineer/Dashboard";
import AppLayout from "./layouts/AppLayouts";
import useAuthStore from "./store/auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const RoleRoute = ({ children, role }: { children: React.ReactNode; role: string }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Manager routes */}
          <Route
            path="dashboard"
            element={
              user?.role === "manager" ? (
                <ManagerDashboard />
              ) : (
                <EngineerDashboard />
              )
            }
          />
          <Route
            path="engineers"
            element={
              <RoleRoute role="manager">
                <Engineers />
              </RoleRoute>
            }
          />
          <Route
            path="projects"
            element={
              <RoleRoute role="manager">
                <Projects />
              </RoleRoute>
            }
          />
          <Route
            path="assignments"
            element={
              <RoleRoute role="manager">
                <Assignments />
              </RoleRoute>
            }
          />
          <Route
            path="ai-match"
            element={
              <RoleRoute role="manager">
                <AIMatch />
              </RoleRoute>
            }
          />

          <Route index element={<Navigate to="/dashboard" />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;