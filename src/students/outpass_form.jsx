import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import StudentSidebar from "./StudentSidebar";

/* ================= CONSTANTS ================= */

const OUTPASS_TYPES = [
  { value: "local", label: "Local" },
  { value: "home", label: "Home" },
  { value: "outstation", label: "Outstation" },
];

const TYPES_REQUIRING_PLACE = ["home", "outstation"];

const INITIAL_FORM = {
  place: "",
  purpose: "",
  departure: "",
  arrival: "",
  parent_contact: "",
};

export default function OutpassForm() {
  const navigate = useNavigate();
  const [type, setType] = useState("local");
  const [isEmergency, setIsEmergency] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requiresPlace = TYPES_REQUIRING_PLACE.includes(type);

  /* ================= HELPERS ================= */

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTypeChange(newType) {
    setType(newType);
    setForm(INITIAL_FORM);
    setError("");
  }

  /* ================= VALIDATION ================= */

  function validate() {
    if (!form.purpose.trim()) {
      setError("Please enter a purpose.");
      return false;
    }

    if (requiresPlace && !form.place.trim()) {
      setError("Please enter a place of visit.");
      return false;
    }

    if (!form.departure || !form.arrival) {
      setError("Please enter departure and arrival times.");
      return false;
    }

    if (!form.parent_contact.trim()) {
      setError("Please enter a parent contact number.");
      return false;
    }

    if (new Date(form.arrival) <= new Date(form.departure)) {
      setError("Arrival time must be after departure time.");
      return false;
    }

    setError("");
    return true;
  }

  /* ================= SUBMIT ================= */

  async function submit() {
    if (!validate()) return;

    try {
      setLoading(true);
      setError("");

      await apiFetch("/api/outpass/create", {
        method: "POST",
        body: JSON.stringify({
          outpass_type: type,
          place_of_visit: requiresPlace ? form.place : "",
          purpose: form.purpose,
          departure_datetime: form.departure,
          arrival_datetime: form.arrival,
          parent_contact: form.parent_contact,
          is_emergency: isEmergency,
        }),
      });

      setForm(INITIAL_FORM);
      setIsEmergency(false);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-white overflow-hidden font-sans text-gray-800">
      <StudentSidebar />
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] relative overflow-hidden">
            
            {/* HEADER */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#6d0f16] tracking-tight">
                Create Outpass
              </h1>
              <p className="text-gray-500 mt-2 text-sm font-medium">
                Submit hostel leave request
              </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div
                role="alert"
                className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}

            {/* TYPE DROPDOWN */}
            <div className="mb-4">
              <label htmlFor="outpass-type" className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">
                Outpass Type
              </label>
              <select
                id="outpass-type"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:border-transparent bg-white shadow-sm transition-shadow appearance-none"
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {OUTPASS_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* EMERGENCY CHECKBOX */}
            <div className="mb-6 flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-white shadow-sm transition-shadow cursor-pointer hover:bg-gray-50">
              <input
                id="is-emergency"
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#6d0f16] focus:ring-[#6d0f16] cursor-pointer"
              />
              <label htmlFor="is-emergency" className="text-sm font-medium text-gray-700 cursor-pointer select-none flex-1">
                This is an Emergency Outpass
              </label>
            </div>

            {/* PURPOSE */}
            <div className="mb-6">
              <Input
                id="purpose"
                label="Purpose"
                value={form.purpose}
                onChange={(v) => updateField("purpose", v)}
                placeholder="Enter reason for leave"
              />
            </div>

            {/* PLACE OF VISIT */}
            {requiresPlace && (
              <div className="mb-6">
                <Input
                  id="place"
                  label="Place of Visit"
                  value={form.place}
                  onChange={(v) => updateField("place", v)}
                  placeholder="Enter city or location"
                />
              </div>
            )}

            {/* PARENT CONTACT */}
            <div className="mb-6">
              <Input
                id="parent-contact"
                label="Parent Contact"
                value={form.parent_contact}
                onChange={(v) => updateField("parent_contact", v)}
                placeholder="Enter parent phone number"
              />
            </div>

            {/* DATETIME */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Input
                id="departure"
                label="Departure Time"
                type="datetime-local"
                value={form.departure}
                onChange={(v) => updateField("departure", v)}
              />

              <Input
                id="arrival"
                label="Arrival Time"
                type="datetime-local"
                value={form.arrival}
                onChange={(v) => updateField("arrival", v)}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-[#6d0f16] hover:bg-[#5a0c12] active:bg-[#4a0a0f] text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
            >
              {loading ? "Submitting..." : "Submit Outpass"}
            </button>

            {/* SUCCESS MODAL */}
            {submitted && (
              <SuccessModal navigate={navigate} setSubmitted={setSubmitted} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= INPUT ================= */
function Input({ id, label, type = "text", value, onChange, placeholder = "" }) {
  return (
    <label htmlFor={id} className="block group">
      <span className="block text-xs font-bold text-gray-600 mb-1.5 ml-1 transition-colors group-focus-within:text-[#6d0f16]">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:border-transparent bg-white shadow-sm transition-shadow placeholder:text-gray-400"
      />
    </label>
  );
}

/* ================= SUCCESS MODAL ================= */
function SuccessModal({ navigate, setSubmitted }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-heading"
        className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="w-20 h-20 rounded-full bg-green-50 border-[6px] border-green-100 text-green-500 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </div>

        <h3 id="success-heading" className="font-bold text-2xl text-gray-900 mb-2">
          Outpass Submitted
        </h3>

        <p className="text-sm text-gray-500 mb-8 font-medium">
          Your request has been submitted successfully and is waiting for approval.
        </p>

        <button
          onClick={() => {
            setSubmitted(false);
            navigate("/outpasses");
          }}
          className="bg-[#6d0f16] hover:bg-[#560c12] text-white px-6 py-3.5 rounded-xl w-full transition font-bold shadow-sm"
        >
          Go to My Outpasses
        </button>
      </div>
    </div>
  );
}
