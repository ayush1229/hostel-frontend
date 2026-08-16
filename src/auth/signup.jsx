import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import {
  validateDepartmentRollNumber,
  validateStudentEmail,
  NITH_HOSTELS,
} from "./departmentValidation";

function Signup() {
  const navigate = useNavigate();

  // Multi-step form state: 1 = Email, 2 = OTP, 3 = Full Details
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    hostel: "",
    room: "",
    department: "",
    rollno: "",
    degree_type: "",
    academic_year: "",
    role: "student",
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your college email");
      return;
    }
    if (!formData.email.endsWith("@nith.ac.in")) {
      setError("Use your college email (@nith.ac.in)");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, role: "student" }),
      });
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const data = await apiFetch("/api/auth/verify-signup-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, otp }),
      });
      
      // If no error was thrown, it passed! Open the signup page.
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err.message || "OTP Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSignup = async (e) => {
    e.preventDefault();

    if (
      !formData.name || !formData.password || !formData.confirmPassword ||
      !formData.phone || !formData.hostel || !formData.room ||
      !formData.department || !formData.rollno || !formData.degree_type ||
      !formData.academic_year
    ) {
      setError("Please fill all fields");
      return;
    }

    if (!acceptedPrivacy) {
      setError("Please accept the Privacy Policy.");
      return;
    }

    if (!validateStudentEmail(formData.email, formData.rollno)) {
      setError("Email must be in the format rollno@nith.ac.in");
      return;
    }

    if (!validateDepartmentRollNumber(formData.department, formData.rollno)) {
      setError("Roll number does not match the selected department.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...formData,
        role: "student",
        otp: otp, // Pass it again in case the final register endpoint requires it
      };

      const data = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const savedUser = {
        ...(data.user || {}),
        role: "student",
        token: data.token,
      };

      localStorage.setItem("token", data.token || "");
      localStorage.setItem("user", JSON.stringify(savedUser));

      navigate("/student");
    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f5f5f5]">
      {/* LEFT */}
      <div className="hidden md:flex w-1/2 bg-[#5b0e0e] text-white items-center justify-center p-16">
        <div>
          <h1 className="text-5xl font-bold mb-5">Create Account</h1>
          <p className="text-lg text-gray-200 leading-8">
            Register to access hostel services, outpass requests and complaint management.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-10">
        <div className="bg-white w-full max-w-md rounded-xl shadow-sm border border-gray-200 p-10 max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-semibold text-[#5b0e0e] mb-8 text-center">Signup</h2>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <input
                type="email"
                name="email"
                placeholder="College Email (rollno@nith.ac.in)"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5b0e0e] hover:bg-[#741616] transition text-white py-3 rounded-md disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <p className="text-sm text-gray-600 mb-4">
                OTP sent to <strong>{formData.email}</strong>
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />
              <button
                type="submit"
                disabled={loading || !otp}
                className="w-full bg-[#5b0e0e] hover:bg-[#741616] transition text-white py-3 rounded-md disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {/* STEP 3: FULL FORM */}
          {step === 3 && (
            <form onSubmit={handleFinalSignup}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              >
                <option value="">Select Department</option>
                <option value="ARCHITECTURE">Architecture</option>
                <option value="CHEMICAL ENGINEERING">Chemical Engineering</option>
                <option value="CE">Civil Engineering</option>
                <option value="CSE">Computer Science Engineering</option>
                <option value="DUAL DEGREE CSE">Dual Degree CSE</option>
                <option value="DUAL DEGREE ELECTRONICS">Dual Degree Electronics</option>
                <option value="EE">Electrical Engineering</option>
                <option value="ECE">Electronics & Communication Engineering</option>
                <option value="ENGINEERING PHYSICS">Engineering Physics</option>
                <option value="MNC">Mathematics & Computing</option>
                <option value="MATERIAL SCIENCE">Material Science</option>
                <option value="ME">Mechanical Engineering</option>
              </select>

              <input
                type="text"
                name="rollno"
                placeholder="Roll Number (e.g., 22bcs001)"
                value={formData.rollno}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />

              <select
                name="degree_type"
                value={formData.degree_type}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              >
                <option value="">Select Degree Type</option>
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="B.Arch">B.Arch</option>
                <option value="Dual Degree">Dual Degree</option>
                <option value="PhD">PhD</option>
              </select>

              <select
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
              </select>

              <select
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              >
                <option value="">Select Hostel</option>
                {NITH_HOSTELS.map((h) => (
                  <option key={h.id || h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="room"
                placeholder="Room Number"
                value={formData.room}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />

              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600">
                  I accept the Privacy Policy
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5b0e0e] hover:bg-[#741616] transition text-white py-3 rounded-md disabled:opacity-50"
              >
                {loading ? "Signing up..." : "Complete Signup"}
              </button>
            </form>
          )}

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#5b0e0e] font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;