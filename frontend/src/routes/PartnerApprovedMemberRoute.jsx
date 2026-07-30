import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getRoleLandingPath, isApprovedPartnerMember } from '../utils/roleLanding';

export function PartnerApprovedMemberRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  if (!isApprovedPartnerMember(user)) {
    return <Navigate to={getRoleLandingPath(user)} replace />;
  }
  return children || <Outlet />;
}
