import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getRoleLandingPath, isApprovedPartnerOwner } from '../utils/roleLanding';

export function PartnerOwnerRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  if (!isApprovedPartnerOwner(user)) {
    return <Navigate to={getRoleLandingPath(user)} replace />;
  }
  return children || <Outlet />;
}
