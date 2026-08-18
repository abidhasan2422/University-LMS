

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./components/student/StudentDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/student" element={<StudentLayout />}>
            <Route
              path="dashboard"
              element={<StudentDashboard />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;