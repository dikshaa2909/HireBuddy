import React from 'react';
import { Link, useLocation, useNavigate, Outlet, useMatch } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  MessageSquare,
  Search,
  FileText,
  Home,
  Briefcase,
  FileCheck,
  ClipboardList,
  LogOut, // Import the LogOut icon from Lucide
} from 'lucide-react';
import { auth } from '../firebase'; // Import Firebase auth
import { signOut } from 'firebase/auth'; // Import signOut function

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
    <Link
        to={to}
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
            isActive
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
);

function Layout() {
  const { theme, toggleTheme } = useTheme();
  useLocation();
  const navigate = useNavigate(); // Use the navigate function from react-router-dom

// Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate('/'); // Redirect to the default route (/) after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/analytics', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/profile-ranks', icon: <Users size={20} />, label: 'Profile Ranks' },
    { to: '/hr-gpt', icon: <MessageSquare size={20} />, label: 'HR GPT' },
    { to: '/find-candidates', icon: <Search size={20} />, label: 'Find Candidates' },
    { to: '/doc-generation', icon: <FileText size={20} />, label: 'Doc Generation' },
    { to: '/job-builder', icon: <Briefcase size={20} />, label: 'Job Builder' },
    { to: '/posted-jobs', icon: <ClipboardList size={20} />, label: 'Posted Jobs' },
    { to: '/applications', icon: <FileCheck size={20} />, label: 'Applications' },
  ];

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">HR Suite</h1>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const isActive = useMatch(item.to);
                  return (
                      <NavItem
                          key={item.to}
                          to={item.to}
                          icon={item.icon}
                          label={item.label}
                          isActive={!!isActive}
                      />
                  );
                })}
              </nav>

              {/* Logout Button */}
              <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-3 mt-4 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
  );
}

export default Layout;