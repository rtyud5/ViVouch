import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const currentPath = location.pathname;
  const isHomeActive = currentPath === '/customer' || currentPath === '/customer/home';

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      {/* Top Navbar */}
      <div className="navbar bg-green-600 text-white sticky top-0 z-50 shadow-md">
        <div className="flex-1">
          {/* Quay về trang chủ customer */}
          <Link to="/customer/home" className="btn btn-ghost normal-case text-xl text-white">ViVouch</Link>
        </div>
        <div className="flex-none hidden md:flex">
          <ul className="menu menu-horizontal px-1 text-white">
            <li><Link to="/customer/cart" className={`hover:text-green-200 ${currentPath === '/customer/cart' ? 'font-bold underline' : ''}`}>Cart</Link></li>
            <li><Link to="/customer/my-vouchers" className={`hover:text-green-200 ${currentPath === '/customer/my-vouchers' ? 'font-bold underline' : ''}`}>My Vouchers</Link></li>
            <li><Link to="/customer/profile" className={`hover:text-green-200 ${currentPath === '/customer/profile' ? 'font-bold underline' : ''}`}>Profile</Link></li>
          </ul>
        </div>
        <div className="flex-none">
          <button onClick={handleLogout} className="btn btn-ghost text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span className="hidden md:inline ml-1">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="btm-nav md:hidden bg-green-600 text-white z-50 pb-safe grid grid-cols-3">
        {/* Nút Home */}
        <Link 
          to="/customer/home" 
          className={`flex flex-col items-center justify-center py-2 transition-colors ${isHomeActive ? 'active bg-green-700 text-white' : 'text-green-100 hover:bg-green-700'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="btm-nav-label text-[10px] sm:text-xs">Home</span>
        </Link>

        {/* Nút My Vouchers */}
        <Link 
          to="/customer/my-vouchers" 
          className={`flex flex-col items-center justify-center py-2 transition-colors ${currentPath === '/customer/my-vouchers' ? 'active bg-green-700 text-white' : 'text-green-100 hover:bg-green-700'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          <span className="btm-nav-label text-[10px] sm:text-xs">My Vouchers</span>
        </Link>

        {/* Nút Profile */}
        <Link 
          to="/customer/profile" 
          className={`flex flex-col items-center justify-center py-2 transition-colors ${currentPath === '/customer/profile' ? 'active bg-green-700 text-white' : 'text-green-100 hover:bg-green-700'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="btm-nav-label text-[10px] sm:text-xs">Profile</span>
        </Link>
      </div>
    </div>
  );
}
