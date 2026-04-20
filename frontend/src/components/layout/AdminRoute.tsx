import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
