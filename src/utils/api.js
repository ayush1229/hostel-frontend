const BASE_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export async function apiFetch(
  endpoint,
  options = {}
) {

  let role = "";
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      role = user.role || "";
    }
  } catch (e) {
    // Ignore parse errors
  }

  const response =
    await fetch(
      `${BASE_URL}${endpoint}`,
      {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
          role: role || "",
          ...(options.headers || {}),
        },
      }
    );

  /* ================= AUTO LOGOUT ================= */

  if (
    (response.status === 401 || response.status === 403) &&
    !endpoint.includes('/login') && !endpoint.includes('/verify-otp')
  ) {
    localStorage.clear();
    window.location.href =
      "/login";

    throw new Error(
      "Unauthorized"
    );
  }

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

  if (!response.ok) {

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