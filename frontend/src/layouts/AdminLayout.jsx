import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function AdminLayout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };
  return (
    <div className="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen bg-base-200">
        {/* Navbar for mobile */}
        <div className="w-full navbar bg-slate-900 text-white lg:hidden sticky top-0 z-40 shadow-md">
          <div className="flex-none">
            <label htmlFor="admin-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2 text-xl font-bold">Admin Portal</div>
        </div>
        
        {/* Main Content */}
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div> 
      
      {/* Sidebar */}
      <div className="drawer-side z-50">
        <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-72 md:w-80 min-h-full bg-slate-900 text-white">
          <li className="mb-6 mt-2 text-2xl font-bold px-4 py-2 border-b border-slate-700 tracking-wide text-center">ViVouch Admin</li>
          
          <li className="mb-2"><Link to="/admin/dashboard" className="hover:bg-slate-800 active:bg-slate-700">Dashboard</Link></li>
          <li className="mb-2"><Link to="/admin/partners" className="hover:bg-slate-800 active:bg-slate-700">Partner Management</Link></li>
          <li className="mb-2"><Link to="/admin/users" className="hover:bg-slate-800 active:bg-slate-700">User Management</Link></li>
          <li className="mb-2"><Link to="/admin/vouchers" className="hover:bg-slate-800 active:bg-slate-700">Voucher Approval</Link></li>
          <li className="mb-2"><Link to="/admin/orders" className="hover:bg-slate-800 active:bg-slate-700">Order Management</Link></li>
          <li className="mb-2"><Link to="/admin/audit" className="hover:bg-slate-800 active:bg-slate-700">System Audit Log</Link></li>
          <li className="mt-auto pt-4"><button onClick={handleLogout} className="text-red-400 hover:bg-slate-800 hover:text-red-300 font-bold">Logout</button></li>
        </ul>
      </div>
    </div>
  );
}
