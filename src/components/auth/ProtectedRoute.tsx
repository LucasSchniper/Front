import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Rol } from "../../types";

interface ProtectedRouteProps {
  role: Rol;
  children: ReactNode;
}

function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to={`/${currentUser.role}`} replace />;

  return <>{children}</>;
}

export default ProtectedRoute;
