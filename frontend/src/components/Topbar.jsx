import { Menu, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/useDarkMode.js';

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <header className="bg-white dark:bg-accent-900 shadow-sm border-b border-accent-200 dark:border-accent-700 px-4 sm:px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-accent-100 dark:hover:bg-accent-800 rounded-lg transition-all transform hover:scale-110 active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu size={24} className="text-accent-700 dark:text-accent-300" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Inventaris Barang
            </h2>
            <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">RSJ Ratumbuysang</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 hover:bg-accent-100 dark:hover:bg-accent-800 rounded-lg transition-all duration-300 group"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun size={20} className="text-accent-600 dark:text-accent-300 group-hover:rotate-180 transition-transform duration-300" />
            ) : (
              <Moon size={20} className="text-accent-600 dark:text-accent-300 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>
          
          
          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-accent-800 dark:to-accent-700 rounded-lg border border-primary-200 dark:border-accent-600">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center shadow-md">
              <User size={18} className="text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-accent-800 dark:text-accent-100 truncate max-w-[150px]">{user?.nama || 'User'}</p>
              <p className="text-primary-600 dark:text-primary-400 text-xs uppercase font-semibold">{user?.role || 'Guest'}</p>
            </div>
          </div>
          
          {/* Mobile User Icon */}
          <button className="sm:hidden w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
            <User size={18} className="text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
