import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getRoleLandingPath } from "../utils/roleLanding";

export function RoleRoute({ allowedRoles = [], children }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={getRoleLandingPath(user)}
        replace
      />
    );
  }

  return children || <Outlet />;
}
