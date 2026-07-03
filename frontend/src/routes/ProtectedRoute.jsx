import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const location = useLocation();
  const redirectPath = `${location.pathname}${location.search}`;

  if (!token) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  if (adminOnly && user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
