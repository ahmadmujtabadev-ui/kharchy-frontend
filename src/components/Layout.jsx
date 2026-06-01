import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: '⊞', label: 'Dashboard' },
  { to: '/add', icon: '+', label: 'Add', special: true },
  { to: '/history', icon: '☰', label: 'History' },
  { to: '/fixed', icon: '↻', label: 'Fixed' },
  { to: '/budget', icon: '◎', label: 'Budget' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-bold text-xl">₭</span>
          <span className="font-bold text-gray-800 text-lg">Kharchy</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button onClick={logout} className="text-xs text-red-400 border border-red-200 px-2 py-1 rounded-lg">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-10">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon, label, special }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                special
                  ? 'flex flex-col items-center justify-center w-14 h-14 bg-green-500 rounded-full text-white shadow-lg shadow-green-200 -mt-6 text-2xl font-bold'
                  : `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive ? 'text-green-600' : 'text-gray-400'}`
              }
            >
              <span className={special ? '' : 'text-lg'}>{icon}</span>
              {!special && <span className="text-[10px] font-medium">{label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
