import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  if (!user) return null; // Wait for redirect or load

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden font-sans text-gray-800">
      <StudentSidebar />
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Header */}
          <div className="flex flex-wrap justify-between items-end gap-4 border-b border-gray-200 pb-5 sm:pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#6d0f16] tracking-tight">
                Student Dashboard
              </h2>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                Welcome back, {user.name || "Student"}
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#6d0f16]/10 text-[#6d0f16] flex items-center justify-center font-bold text-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  {user.role || "Student"}
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {user.hostel || "N/A"} - {user.physical_room_id || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/outpasses')}
              className="flex items-center gap-4 bg-gradient-to-br from-[#6d0f16] to-[#8b0f18] text-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Apply for Outpass</h3>
                <p className="text-white/70 text-sm mt-1">Submit a new hostel leave request</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/complaint')}
              className="flex items-center gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 text-gray-800 hover:border-gray-300"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 text-gray-600 border border-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Register Complaint</h3>
                <p className="text-gray-500 text-sm mt-1">Report maintenance or facility issues</p>
              </div>
            </button>
          </div>

          {/* Profile Details Card */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#6d0f16]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Personal Details
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Detail label="Full Name" value={user.name} />
              <Detail label="Roll No" value={user.roll_no || user.rollno} />
              <Detail label="Department" value={user.department} />
              <Detail label="Degree & Year" value={`${user.degree_type || "N/A"} - Year ${user.academic_year || user.current_year || "N/A"}`} />
              <Detail label="Contact Number" value={user.phone} />
              <Detail label="Parent Contact" value={user.parent_phone || user.parent_number || user.parent_contact || "N/A"} />
              <Detail label="Hostel" value={user.hostel} />
              <Detail label="Room Number" value={user.room_number || user.room || user.physical_room_id} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </p>
      <p className="font-semibold text-sm text-gray-800 break-words">
        {value || "-"}
      </p>
    </div>
  );
}
