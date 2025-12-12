export const isAuthenticated = () => !!localStorage.getItem("token");

export const login = (token) => {
  localStorage.setItem("token", token);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminEmail"); // Clear admin email if it exists
};
