// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const isAuth = isAuthenticated();

  // If not authenticated, redirect to login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children (admin routes)
  return children;
}