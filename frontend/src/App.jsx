import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Barang from './pages/Barang';
import AsetMasuk from './pages/AsetMasuk';
import AsetKeluar from './pages/AsetKeluar';
import AsetScan from './pages/AsetScan';
import HabisPakaiMasuk from './pages/HabisPakaiMasuk';
import Laporan from './pages/Laporan';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import AsetDetail from './pages/AsetDetail';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // Show loading spinner while checking auth status
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white dark:from-accent-900 dark:to-accent-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-accent-600 dark:text-accent-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-based Route Component
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white dark:from-accent-900 dark:to-accent-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-accent-600 dark:text-accent-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/aset/:kode_unit" element={<AsetDetail />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="barang" element={
          <ErrorBoundary>
            <Barang />
          </ErrorBoundary>
        } />
        <Route path="aset/masuk" element={<AsetMasuk />} />
        <Route path="aset/keluar" element={<AsetKeluar />} />
        <Route path="aset/scan" element={<AsetScan />} />
        <Route path="habis-pakai/masuk" element={<HabisPakaiMasuk />} />
        
        {/* Profile Route - All users */}
        <Route path="profile" element={<Profile />} />
        
        {/* Admin Only Routes */}
        <Route path="laporan" element={
          <AdminRoute>
            <Laporan />
          </AdminRoute>
        } />
        <Route path="users" element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } />
      </Route>
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DarkModeProvider>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </DarkModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
