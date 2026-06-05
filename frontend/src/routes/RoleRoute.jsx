import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const rolePortalRoutes = {
  CUSTOMER: "/customer/home",
  PARTNER: "/partner/dashboard",
  ADMIN: "/admin/dashboard"
};

export function RoleRoute({ allowedRoles = [], children }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={rolePortalRoutes[user.role] || "/"}
        replace
      />
    );
  }

  return children || <Outlet />;
}
