// utils/auth.js
export const isAuthenticated = () => {
  // Check if token exists in localStorage
  const token = localStorage.getItem("token");
  return !!token; // Returns true if token exists, false otherwise
};

export const login = (token) => {
  localStorage.setItem("token", token);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminEmail");
  sessionStorage.clear();
};

export const clearAuthAndRedirect = (navigate) => {
  logout();
  
  // Clear browser history
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, "", "/login");
  }
  
  if (navigate) {
    navigate("/login", { replace: true });
  } else {
    window.location.href = "/login";
  }
};