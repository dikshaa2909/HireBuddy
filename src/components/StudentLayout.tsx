import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { auth, getUserRole, ROLES } from '../firebase';
import { Moon, Sun, LogOut, Home, FileText, Search, User, Brain, BarChart2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const StudentLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      if (auth.currentUser) {
        const role = await getUserRole(auth.currentUser.uid);
        setUserRole(role);
        
        // Redirect HR users to HR dashboard
        if (role === ROLES.HR) {
          navigate('/analytics');
        }
      }
    };
    
    checkUserRole();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { to: '/student/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/student/applications', icon: <FileText size={20} />, label: 'Applications' },
    { to: '/student/resume-builder', icon: <FileText size={20} />, label: 'Resume Builder' },
    { to: '/student/job-finder', icon: <Search size={20} />, label: 'Job Finder' },
    { to: '/student/aptitude-test', icon: <Brain size={20} />, label: 'Aptitude Tests' },
    { to: '/student/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">HireBuddy</h1>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="mr-3">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </span>
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 mt-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="mr-3">
                <LogOut size={20} />
              </span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">Student Portal</div>
            <div className="flex items-center space-x-2">
              {auth.currentUser && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {auth.currentUser.email}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;