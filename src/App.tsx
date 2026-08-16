import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/login";
import Signup from "./auth/signup";
import OtpVerification from "./auth/otpverification";
import OutpassLayout from "./students/outpasses";
import OutpassForm from "./students/outpass_form.jsx";


import Dashboard from "./students/Dashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OtpVerification />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<Navigate to="/" replace />} />
        <Route path="/outpasses" element={<OutpassLayout />} />
        <Route path="/add-outpass" element={<OutpassForm />} />
        
        {/* Legacy redirects */}
        <Route path="/outpass" element={<Navigate to="/outpasses" replace />} />
        <Route path="/apply-outpass" element={<Navigate to="/add-outpass" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
