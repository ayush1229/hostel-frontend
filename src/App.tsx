import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/login";
import Signup from "./auth/signup";
import OutpassLayout from "./students/outpasses";
import OutpassForm from "./students/outpass_form.jsx";


import Dashboard from "./students/Dashboard";


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem("user");
  const role = localStorage.getItem("role")?.toLowerCase();

  // Basic check for logged in student
  if (!userStr || role !== "student") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Redirect already logged-in students away from public pages (login/signup)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem("user");
  const role = localStorage.getItem("role")?.toLowerCase();

  if (userStr && role === "student") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/otp" element={<Navigate to="/login" replace />} />
        
        {/* Student Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student" element={<Navigate to="/" replace />} />
        
        <Route path="/outpasses" element={
          <ProtectedRoute>
            <OutpassLayout />
          </ProtectedRoute>
        } />
        
        <Route path="/add-outpass" element={
          <ProtectedRoute>
            <OutpassForm />
          </ProtectedRoute>
        } />
        
        {/* Legacy redirects */}
        <Route path="/outpass" element={<Navigate to="/outpasses" replace />} />
        <Route path="/apply-outpass" element={<Navigate to="/add-outpass" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
