import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  ScanLine,
  FileText,
  LogOut,
  ChevronDown,
  Box,
  X,
  AlertCircle,
  User,
  Users
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/barang', icon: Package, label: 'Data Barang' },
    { 
      label: 'Aset',
      icon: Box,
      submenu: [
        { path: '/aset/masuk', icon: ArrowDownToLine, label: 'Barang Masuk' },
        { path: '/aset/keluar', icon: ArrowUpFromLine, label: 'Barang Keluar' },
        { path: '/aset/scan', icon: ScanLine, label: 'Scan QR' },
      ]
    },
    { 
      label: 'Habis Pakai',
      icon: Package,
      submenu: [
        { path: '/habis-pakai/masuk', icon: ArrowDownToLine, label: 'Barang Masuk' },
      ]
    },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  // Tambahkan menu Laporan dan User Management hanya untuk ADMIN
  if (isAdmin()) {
    menuItems.push({ path: '/laporan', icon: FileText, label: 'Laporan' });
    menuItems.push({ path: '/users', icon: Users, label: 'Manajemen User' });
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Smooth animation delay
    setTimeout(() => {
      setShowLogoutModal(false);
      logout();
    }, 800);
  };

  const handleLinkClick = () => {
    // Close mobile menu when link is clicked
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-primary-700 to-primary-900 dark:from-accent-900 dark:to-accent-950 text-white flex flex-col shadow-xl transition-all duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
        
        <div className="p-6 border-b border-primary-600 dark:border-accent-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white dark:bg-accent-800 rounded-lg flex items-center justify-center shadow-lg">
              <Package size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Inventaris RSJ</h1>
              <p className="text-xs text-primary-100 dark:text-accent-400">Sistem Manajemen</p>
            </div>
          </div>
          <div className="bg-white/10 dark:bg-accent-800/50 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-primary-100 dark:text-accent-300 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{user?.nama}</p>
            <span className="inline-block mt-2 px-3 py-1 text-xs bg-gradient-to-r from-primary-500 to-primary-600 dark:from-accent-700 dark:to-accent-600 rounded-full font-medium">
              {user?.role || 'User'}
            </span>
          </div>
        </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path || item.label}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className="flex items-center justify-between w-full gap-3 px-4 py-3 text-primary-100 dark:text-accent-300 hover:bg-white/10 dark:hover:bg-accent-800/50 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${openSubmenu === item.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <ul className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${openSubmenu === item.label ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.path}
                          onClick={handleLinkClick}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group ${
                            isActive(subItem.path)
                              ? 'bg-white text-primary-700 dark:bg-accent-700 dark:text-white shadow-md font-semibold'
                              : 'text-primary-100 dark:text-accent-300 hover:bg-white/10 dark:hover:bg-accent-800/50 hover:translate-x-1'
                          }`}
                        >
                          <subItem.icon size={18} className="group-hover:scale-110 transition-transform" />
                          <span className="text-sm">{subItem.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-white text-primary-700 dark:bg-accent-700 dark:text-white shadow-md font-semibold'
                      : 'text-primary-100 dark:text-accent-300 hover:bg-white/10 dark:hover:bg-accent-800/50 hover:translate-x-1'
                  }`}
                >
                  <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-primary-600 dark:border-accent-800">
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-primary-100 dark:text-accent-300 hover:bg-red-500/20 transition-all duration-200 group hover:translate-x-1"
        >
          <LogOut size={20} className="group-hover:scale-110 group-hover:rotate-12 transition-all" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
    
    {/* Logout Confirmation Modal */}
    {showLogoutModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className={`bg-white dark:bg-accent-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${
          isLoggingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <AlertCircle size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Konfirmasi Logout</h3>
                <p className="text-red-100 text-sm mt-1">Anda akan keluar dari sistem</p>
              </div>
            </div>
          </div>
          
          {/* Modal Body */}
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Apakah Anda yakin ingin keluar? Anda perlu login kembali untuk mengakses sistem.
            </p>
            
            {/* Loading State */}
            {isLoggingOut && (
              <div className="flex items-center justify-center gap-3 py-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
                <span className="text-red-600 dark:text-red-400 font-medium">Logging out...</span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-accent-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ripple"
              >
                <LogOut size={18} />
                <span>Ya, Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Sidebar;
