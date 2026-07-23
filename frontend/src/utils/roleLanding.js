export function getRoleLandingPath(user) {
  if (!user) return '/login';
  if (user.role === 'CUSTOMER') return '/customer/home';
  if (user.role === 'ADMIN') return '/admin/dashboard';
  if (user.role !== 'PARTNER') return '/';

  const membership = user.partnerMemberships?.[0];
  if (!membership || membership.partner?.status !== 'APPROVED') return '/partner/profile';
  return membership.role === 'STAFF' ? '/partner/validation' : '/partner/dashboard';
}

export function isApprovedPartnerOwner(user) {
  const membership = user?.partnerMemberships?.[0];
  return user?.role === 'PARTNER'
    && membership?.role === 'OWNER'
    && membership?.status === 'ACTIVE'
    && membership?.partner?.status === 'APPROVED';
}
