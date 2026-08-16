import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

const Login = () => (
  <div className="container mt-5">
    <h2>Login</h2>
  </div>
);

const AdminDashboard = () => (
  <h2>Admin Dashboard</h2>
);

const InstructorDashboard = () => (
  <h2>Instructor Dashboard</h2>
);

const StudentDashboard = () => (
  <h2>Student Dashboard</h2>
);

const Unauthorized = () => (
  <div className="container mt-5">
    <h2>403 - Unauthorized</h2>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>

            {/* Admin */}
            <Route element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              />
            }>
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
              />
            </Route>

            {/* Instructor */}
            <Route element={
              <RoleRoute
                allowedRoles={["INSTRUCTOR"]}
              />
            }>
              <Route
                path="/instructor/dashboard"
                element={<InstructorDashboard />}
              />
            </Route>

            {/* Student */}
            <Route element={
              <RoleRoute
                allowedRoles={["STUDENT"]}
              />
            }>
              <Route
                path="/student/dashboard"
                element={<StudentDashboard />}
              />
            </Route>

          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;