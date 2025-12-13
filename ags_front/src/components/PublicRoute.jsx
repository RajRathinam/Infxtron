// components/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function PublicRoute({ children }) {
  const isAuth = isAuthenticated();

  // If already authenticated, redirect to admin dashboard
  if (isAuth) {
    return <Navigate to="/admin" replace />;
  }

  // If not authenticated, show the public page (login)
  return children;
}