import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { apiFetch } from "../utils/api";
import StudentSidebar from "./StudentSidebar";

export default function OutpassLayout() {
  const navigate = useNavigate();

  const [selectedOutpass, setSelectedOutpass] = useState(null);
  const [filter, setFilter] = useState("All");

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 5;

  /* ================= FETCH (TANSTACK QUERY) ================= */
  const {
    data: outpasses = [],
    isLoading: loading,
    error,
    refetch: fetchOutpasses,
  } = useQuery({
    queryKey: ["outpasses"],
    queryFn: async () => {
      const res = await apiFetch("/api/outpass/me");
      return res?.data || [];
    },
  });

  /* ================= METRICS ================= */
  const metrics = useMemo(() => {
    let total = outpasses.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0; // Rejected or Cancelled

    outpasses.forEach((o) => {
      const status = (o.status || o.outp_status)?.toLowerCase();
      if (status === "pending") pending++;
      else if (status === "approved") approved++;
      else if (status === "rejected" || status === "cancelled") rejected++;
    });

    return { total, pending, approved, rejected };
  }, [outpasses]);

  /* ================= FILTER & PAGINATE ================= */
  const filteredOutpasses = useMemo(() => {
    if (filter === "All") return outpasses;
    if (filter === "Rejected") {
      return outpasses.filter(
        (o) => {
          const status = (o.status || o.outp_status)?.toLowerCase();
          return status === "rejected" || status === "cancelled";
        }
      );
    }
    return outpasses.filter(
      (o) => (o.status || o.outp_status)?.toLowerCase() === filter.toLowerCase()
    );
  }, [outpasses, filter]);

  const totalItems = filteredOutpasses.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  
  const paginatedOutpasses = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredOutpasses.slice(startIndex, startIndex + limit);
  }, [filteredOutpasses, page, limit]);

  const handleFilterChange = (status) => {
    setFilter(status);
    setPage(1);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-white overflow-hidden font-sans text-gray-800">
      <StudentSidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#6d0f16] tracking-tight">
                My Outpasses
              </h1>
              <p className="text-gray-500 mt-1 text-sm font-medium">
                Track and manage your hostel leave requests
              </p>
            </div>
            
            <button
              onClick={() => navigate("/add-outpass")}
              className="bg-[#6d0f16] hover:bg-[#560c12] active:bg-[#4a0a0f] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2 shrink-0"
            >
              <span className="text-lg leading-none">+</span> New Outpass
            </button>
          </div>

          {/* LOADING & ERROR */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-500">Loading your outpasses...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <p className="text-sm font-medium">{error.message || "An error occurred"}</p>
              </div>
              <button
                onClick={() => fetchOutpasses()}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* METRICS CARDS */}
              <div className="flex overflow-x-auto gap-2.5 pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 scrollbar-none">
                <MetricCard 
                  title="TOTAL" 
                  value={metrics.total} 
                  subtitle="All requests created" 
                  color="text-[#6d0f16]"
                />
                <MetricCard 
                  title="PENDING" 
                  value={metrics.pending} 
                  subtitle="Waiting for approval" 
                  color="text-amber-600"
                />
                <MetricCard 
                  title="APPROVED" 
                  value={metrics.approved} 
                  subtitle="Ready for checkout" 
                  color="text-green-600"
                />
                <MetricCard 
                  title="REJECTED" 
                  value={metrics.rejected} 
                  subtitle="Declined or Cancelled" 
                  color="text-red-600"
                />
              </div>

              {/* FILTERS */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {["All", "Pending", "Approved", "Rejected"].map((status) => {
                  let count = 0;
                  if (status === "All") count = metrics.total;
                  else if (status === "Pending") count = metrics.pending;
                  else if (status === "Approved") count = metrics.approved;
                  else if (status === "Rejected") count = metrics.rejected;

                  if (count === 0 && status !== "All") return null;

                  const active = filter === status;
                  
                  return (
                    <button
                      key={status}
                      onClick={() => handleFilterChange(status)}
                      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm border ${
                        active 
                          ? "bg-[#6d0f16] text-white border-[#6d0f16]" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {status}
                      <span 
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* TABLE */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Destination</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedOutpasses.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="flex justify-center mb-4">
                              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">No outpasses found</h3>
                            <p className="text-sm text-gray-500 mt-1">Try changing your filters or create a new request.</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedOutpasses.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-sm text-gray-900">OP-{o.id.substring(0,8)}...</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-600">{o.outpass_type}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-600">{o.place_of_visit || "Local"}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <StatusBadge status={o.status} />
                                {o.status?.toLowerCase() === "approved" && (
                                  <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                                    <span className={`px-1.5 py-0.5 rounded ${(o.hostel_std_status === 'Out' || o.std_status === 'Out') ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                      Hostel: {(o.hostel_std_status === 'Out' || o.std_status === 'Out') ? 'Out' : (o.hostel_std_status || "In")}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded ${o.std_status === 'Out' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                      Gate: {o.std_status || "In"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedOutpass(o)}
                                className="inline-flex items-center justify-center bg-[#6d0f16] hover:bg-[#560c12] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-1"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION FOOTER */}
                {totalItems > 0 && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-medium text-gray-500">
                      Showing page <span className="font-bold text-gray-700">{page}</span> of <span className="font-bold text-gray-700">{totalPages}</span> ({totalItems} items total)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-white hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-transparent"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-bold text-gray-400 px-2">{page} / {totalPages}</span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-white hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-transparent"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* MODAL */}
      {selectedOutpass && (
        <OutpassModal 
          outpass={selectedOutpass} 
          onClose={() => setSelectedOutpass(null)} 
        />
      )}
    </div>
  );
}

/* ================= METRIC CARD ================= */
function MetricCard({ title, value, subtitle, color = "text-[#6d0f16]" }) {
  return (
    <div className="bg-white border border-gray-100/90 rounded-xl sm:rounded-3xl p-2.5 sm:p-6 shadow-xs sm:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-gray-200 transition-all shrink-0 min-w-[110px] sm:min-w-0">
      <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-2">{title}</p>
      <p className={`text-base sm:text-4xl font-extrabold sm:font-bold ${color} mb-0 sm:mb-2 tabular-nums`}>{value}</p>
      {subtitle && <p className="hidden sm:block text-xs font-medium text-gray-400 truncate">{subtitle}</p>}
    </div>
  );
}

/* ================= STATUS BADGE ================= */
function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  
  let bg = "bg-gray-100";
  let text = "text-gray-600";
  
  if (s === "approved") { bg = "bg-green-100"; text = "text-green-700"; }
  else if (s === "pending") { bg = "bg-amber-100"; text = "text-amber-700"; }
  else if (s === "rejected" || s === "cancelled") { bg = "bg-red-100"; text = "text-red-700"; }

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${bg} ${text}`}>
      {status}
    </span>
  );
}

/* ================= MODAL ================= */
function OutpassModal({ outpass, onClose }) {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const isAlreadyOut = outpass.std_status === "Out" || outpass.hostel_std_status === "Out";
  const canCancel = (outpass.status?.toLowerCase() === "pending" || outpass.status?.toLowerCase() === "approved") && outpass.is_active && !isAlreadyOut;

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return await apiFetch(`/api/outpass/${outpass.id}/cancel`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outpasses"] });
      onClose();
    },
    onError: (err) => {
      console.error("Cancel outpass error:", err);
      setCancelError(err.message || "Failed to cancel outpass. Please try again.");
    }
  });

  const handleCancel = () => {
    setCancelError("");
    cancelMutation.mutate();
  };
  const canceling = cancelMutation.isPending;

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-sm p-6 sm:p-8 rounded-3xl shadow-2xl text-center animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="font-bold text-xl text-gray-900 mb-2">Cancel Outpass?</h3>
          <p className="text-sm font-medium text-gray-500 mb-5">This action cannot be undone.</p>

          {/* INLINE ERROR ALERT */}
          {cancelError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-start gap-2 text-left">
              <span className="text-base shrink-0 leading-tight">⚠️</span>
              <div className="flex-1">
                <p className="font-bold">Cannot Cancel</p>
                <p className="mt-0.5">{cancelError}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold transition disabled:opacity-50 shadow-sm"
            >
              {canceling ? "Canceling..." : "Yes, Cancel Outpass"}
            </button>
            <button
              onClick={() => {
                setCancelError("");
                setShowConfirm(false);
              }}
              disabled={canceling}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition disabled:opacity-50"
            >
              Keep Outpass
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-[#6d0f16] flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Outpass Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 pt-2 max-h-[80vh] overflow-y-auto space-y-6">
          {/* QR Code section for Approved outpasses */}
          {outpass.status?.toLowerCase() === "approved" && (
            <div className="p-5 bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/80 rounded-3xl flex flex-col sm:flex-row items-center gap-5 shadow-sm">
              <div className="bg-white p-3 rounded-2xl shadow-md border border-amber-100 shrink-0">
                <QRCodeSVG
                  value={outpass.id}
                  size={130}
                  level="M"
                  includeMargin={false}
                  className="rounded-lg"
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Digital Gate Pass
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Gate Barcode / QR</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Show this code to the security guard at the gate scanner to automatically log your <strong>Exit</strong> and <strong>Return</strong>.
                </p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-[11px] text-gray-500 font-mono bg-white/80 px-2.5 py-1.5 rounded-lg border border-amber-100/80">
                  <span className="font-sans font-bold text-[10px] text-gray-400 uppercase tracking-widest">ID:</span>
                  <span className="truncate max-w-[200px]">{outpass.id}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Detail label="Type" value={outpass.outpass_type} />
            <Detail label="Place" value={outpass.place_of_visit} />
            <Detail label="Purpose" value={outpass.purpose} />
            <Detail
              label="Departure"
              value={
                outpass.departure_datetime
                  ? new Date(outpass.departure_datetime).toLocaleString("en-IN")
                  : "-"
              }
            />
            <Detail
              label="Arrival"
              value={
                outpass.arrival_datetime
                  ? new Date(outpass.arrival_datetime).toLocaleString("en-IN")
                  : "-"
              }
            />
            <Detail label="Status" value={outpass.status} />
            <Detail label="Hostel Status" value={(outpass.hostel_std_status === 'Out' || outpass.std_status === 'Out') ? 'Outside Hostel' : 'Inside Hostel'} />
            <Detail label="Campus Gate Status" value={outpass.std_status === 'Out' ? 'Outside Campus' : 'Inside Campus'} />
          </div>

          {canCancel ? (
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Cancel Outpass
              </button>
            </div>
          ) : isAlreadyOut && outpass.is_active ? (
            <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5">
              <span className="text-base">ℹ️</span>
              <span>This outpass cannot be cancelled because you have already exited campus/hostel.</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="font-bold text-sm text-gray-800 break-words">{value || "-"}</p>
    </div>
  );
}