// Session-based authentication check
export const isAuthenticated = () => !!localStorage.getItem("adminEmail");

export const login = (isAuth) => {
  if (isAuth) {
    localStorage.setItem("isAuthenticated", "true");
  }
};

export const logout = async () => {
  try {
    const { adminAPI } = await import("./api");
    await adminAPI.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("isAuthenticated");
  }
};
