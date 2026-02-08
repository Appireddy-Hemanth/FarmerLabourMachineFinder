import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Leaf, UserCircle } from 'lucide-react';
import { useAuth } from '../state/auth';
import { Chatbot } from '../components/Chatbot';

export function AppLayout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const labourLink = currentUser?.role === 'labourer' ? '/labour/dashboard' : '/labour';

  return (
    <div className="app-shell dashboard-shell">
      <header className="px-4 md:px-8 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-green-900 font-semibold">
          <span className="w-9 h-9 rounded-full bg-green-800 text-white flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </span>
          <span className="display-font text-lg">AgriConnect</span>
        </NavLink>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <NavLink to={labourLink} className="hover:text-green-700">Labour</NavLink>
          <NavLink to="/machines" className="hover:text-green-700">Machines</NavLink>
          <NavLink to="/profile" className="hover:text-green-700">Profile</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {currentUser ? null : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
            >
              <UserCircle className="w-4 h-4" />
              Login
            </button>
          )}
        </div>
      </header>

      <main className="px-4 md:px-8 pb-16">
        <Outlet />
      </main>

      <footer className="px-4 md:px-8 py-6 text-sm text-gray-600 border-t border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span>AgriConnect • Farmer–Labour–Machine Finder</span>
          <span>Support: support@agriconnect.demo • +91 90000 00000</span>
        </div>
      </footer>

      <Chatbot currentUser={currentUser} />
    </div>
  );
}

