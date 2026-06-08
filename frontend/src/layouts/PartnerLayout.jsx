import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function PartnerLayout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };
  return (
    <div className="drawer lg:drawer-open">
      <input id="partner-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen bg-base-200">
        {/* Navbar for mobile */}
        <div className="w-full navbar bg-purple-900 text-white lg:hidden sticky top-0 z-40 shadow-md">
          <div className="flex-none">
            <label htmlFor="partner-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2 text-xl font-bold">Partner Portal</div>
        </div>
        
        {/* Main Content */}
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div> 
      
      {/* Sidebar */}
      <div className="drawer-side z-50">
        <label htmlFor="partner-drawer" aria-label="close sidebar" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-72 md:w-80 min-h-full bg-purple-900 text-white">
          <li className="mb-6 mt-2 text-2xl font-bold px-4 py-2 border-b border-purple-700 tracking-wide text-center">ViVouch Partner</li>
          
          <li className="mb-2"><Link to="/partner/dashboard" className="hover:bg-purple-800 active:bg-purple-700">Dashboard</Link></li>
          <li className="mb-2"><Link to="/partner/vouchers" className="hover:bg-purple-800 active:bg-purple-700">Voucher Management</Link></li>
          <li className="mb-2"><Link to="/partner/validation" className="hover:bg-purple-800 active:bg-purple-700">Validate Voucher</Link></li>
          <li className="mb-2"><Link to="/partner/reports" className="hover:bg-purple-800 active:bg-purple-700">Analytics & Reports</Link></li>
          <li className="mb-2"><Link to="/partner/profile" className="hover:bg-purple-800 active:bg-purple-700">Branch Profile</Link></li>
          <li className="mt-auto pt-4"><button onClick={handleLogout} className="text-red-300 hover:bg-purple-800 hover:text-red-200 font-bold">Logout</button></li>
        </ul>
      </div>
    </div>
  );
}
