const isRenderHost = typeof window !== "undefined" && window.location.hostname.includes("onrender.com");
const DEFAULT_URL = isRenderHost ? "https://hostel-backend-cveq.onrender.com" : "http://localhost:4000";
const BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_URL).replace(/\/$/, "");

export async function apiFetch(
  endpoint,
  options = {}
) {

  let role = "";
  let token = localStorage.getItem("token") || "";
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      role = user.role || "";
      if (!token && user.token) {
        token = user.token;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        role: role || "",
        ...(token ? { Authorization: `Bearer ${token}`, token } : {}),
        ...(options.headers || {}),
      },
    }
  );

  const text =
    await response.text();

  let data = {};

  try {
    data = text
      ? JSON.parse(text)
      : {};
  } catch {
    throw new Error(
      "Invalid server response"
    );
  }

  /* ================= AUTO LOGOUT ================= */
  const isAuthEndpoint = 
    endpoint.startsWith("/api/auth/") || 
    endpoint.includes("/login") || 
    endpoint.includes("/send-otp") || 
    endpoint.includes("/verify");

  if (!response.ok) {
    const errorMsg = (data.message || data.error || "").toLowerCase();

    if (
      !isAuthEndpoint &&
      (response.status === 401 ||
       response.status === 403 ||
       errorMsg.includes("log in again") ||
       errorMsg.includes("session has expired") ||
       errorMsg.includes("unauthorized") ||
       errorMsg.includes("session expired"))
    ) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Your session has expired. Redirecting to login...");
    }

    const err = new Error(
      data.message ||
      data.error ||
      "Request failed"
    );
    err.data = data;
    throw err;
  }

  return data;
}