import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Package, Shield, TrendingUp, Eye, EyeOff, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [rememberedUsername] = useState(() => localStorage.getItem('rememberedUsername') || '');
  const [formData, setFormData] = useState({
    username: rememberedUsername,
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUsername));
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Clear localStorage dan redirect jika sudah login
  useEffect(() => {
    // Clear any old tokens saat buka halaman login
    if (!isAuthenticated) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error saat user mengetik
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi input
    if (!formData.username || !formData.password) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      
      if (!result.success) {
        setError(result.message || 'Login gagal. Periksa username dan password Anda.');
        setLoading(false);
      } else {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', formData.username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
        
        // Show success animation
        setLoginSuccess(true);
        
        // Redirect after animation (handled by AuthContext)
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Simple Modern Background */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient - smooth and clean */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900 lg:clip-path-diagonal"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 via-white to-gray-50 lg:clip-path-diagonal-inverse"></div>
        
        {/* Subtle glow effect - minimal */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-400/5 rounded-full blur-3xl"></div>
        
        {/* Accent line - single elegant line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block hidden"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            
            {/* Left Section - Branding */}
            <div className="lg:col-span-2 text-center lg:text-left space-y-6 lg:space-y-8">
              {/* Logo & Title */}
              <div className="space-y-4">
                <div className="inline-flex lg:flex items-center gap-4 justify-center lg:justify-start">
                  <div className="relative group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform hover:rotate-6 hover:scale-110 transition-all duration-500 group-hover:shadow-red-300">
                      <Package size={36} className="text-red-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-300 shadow-lg">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white lg:text-gray-800 leading-tight">
                      Inventaris Barang
                    </h1>
                    <p className="text-lg sm:text-xl font-semibold text-red-100 lg:text-red-600">
                      RSJ Ratumbuysang
                    </p>
                  </div>
                </div>
                
                <p className="text-base sm:text-lg text-white/90 lg:text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Sistem ini dikembangkan untuk mendukung proses pengelolaan inventaris rumah sakit, mulai dari pencatatan barang, pengelolaan aset, hingga penyusunan laporan inventaris.
                </p>
              </div>

              {/* Features List */}
              <div className="hidden lg:block space-y-3">
                {[
                  { icon: Shield, text: 'Autentikasi dan pembagian hak akses pengguna' },
                  { icon: TrendingUp, text: 'Penyusunan laporan berdasarkan data inventaris' },
                  { icon: Package, text: 'Pengelolaan data aset dan barang habis pakai' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700 group cursor-pointer transform hover:translate-x-2 transition-all duration-300">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-md">
                      <feature.icon size={20} className="text-red-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-gray-900 transition-colors">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="lg:col-span-3 flex justify-center lg:justify-end">
              <div className="w-full max-w-md lg:max-w-lg">
                <div className="glass-card rounded-3xl shadow-2xl overflow-hidden border-white/30">
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 sm:px-8 py-6 sm:py-8 relative overflow-hidden">
                    {/* Animated background shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 relative z-10">Login</h2>
                    <p className="text-red-100 text-sm sm:text-base relative z-10">Masuk ke dashboard inventaris</p>
                  </div>

                  {/* Form Body */}
                  <div className="px-6 sm:px-8 py-6 sm:py-8">
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 animate-slide-down">
                        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800 text-sm">Login Gagal</p>
                          <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Username Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Username
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedInput === 'username' ? 'transform scale-105' : ''}`}>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            onFocus={() => setFocusedInput('username')}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:shadow-lg transition-all outline-none text-gray-800 placeholder-gray-400 hover:border-gray-300"
                            placeholder="Masukkan username Anda"
                            required
                          />
                          {focusedInput === 'username' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent rounded-xl pointer-events-none"></div>
                          )}
                        </div>
                      </div>

                      {/* Password Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedInput === 'password' ? 'transform scale-105' : ''}`}>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full px-4 py-3.5 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:shadow-lg transition-all outline-none text-gray-800 placeholder-gray-400 hover:border-gray-300"
                            placeholder="Masukkan password Anda"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 hover:scale-110 transition-all p-1 rounded-lg hover:bg-red-50"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                          {focusedInput === 'password' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent rounded-xl pointer-events-none"></div>
                          )}
                        </div>
                      </div>

                      {/* Remember Me Checkbox */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer transition-all hover:scale-110"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-800 group-hover:translate-x-1 transition-all">
                            Ingat saya
                          </span>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-3 disabled:cursor-not-allowed transform group relative overflow-hidden ripple ${
                          loginSuccess 
                            ? 'bg-green-600 hover:bg-green-600' 
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:-translate-y-1 active:translate-y-0'
                        } text-white`}
                      >
                        {loginSuccess ? (
                          <>
                            <CheckCircle size={20} className="animate-bounce" />
                            <span>Login Berhasil!</span>
                          </>
                        ) : loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <>
                            <span>Masuk Sekarang</span>
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-center text-xs sm:text-sm text-gray-500">
                        Sistem Inventaris Rumah Sakit Jiwa Ratumbuysang
                      </p>
                      <p className="text-center text-xs text-gray-400 mt-2">
                        © 2026 RSJ Ratumbuysang. Hak cipta dilindungi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Background Overlay */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-red-600/95 via-red-700/95 to-red-900/95 z-0"></div>
    </div>
  );
};

export default Login;
