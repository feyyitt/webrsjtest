import { useState, useEffect, useCallback } from 'react';
import { Package, TrendingUp, TrendingDown, Archive, Plus, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../services/axios';
import Loading from '../components/Loading';
import Button from '../components/Button';

const summarizeAsetMutation = (item) => {
  const detail = item.mutasi_detail_aset?.[0];
  const unitAset = detail?.unit_aset;
  const penerimaanAset = unitAset?.penerimaan_aset;
  const barang = penerimaanAset?.barang;

  return {
    barang: barang?.nama_barang || barang?.kode_barang || '-',
    jumlah: item.mutasi_detail_aset?.length || 0,
    satuan: barang?.satuan || 'unit',
    keterangan: item.keterangan,
  };
};

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBarang: 0,
    barangMasuk: 0,
    barangKeluar: 0,
    stokTersedia: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch stats from backend
      const [barangRes, asetMasukRes, asetKeluarRes, habisPakaiMasukRes, habisPakaiKeluarRes] = await Promise.all([
        axiosInstance.get('/barang', { params: { page: 1, limit: 1 } }).catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
        axiosInstance.get('/aset/masuk', { params: { page: 1, limit: 5 } }).catch(() => ({ data: { data: { items: [], pagination: { total: 0 } } } })),
        axiosInstance.get('/aset/keluar', { params: { page: 1, limit: 5 } }).catch(() => ({ data: { data: { items: [], pagination: { total: 0 } } } })),
        axiosInstance.get('/habis-pakai/masuk', { params: { page: 1, limit: 5 } }).catch(() => ({ data: { data: { items: [], pagination: { total: 0 } } } })),
        Promise.resolve({ data: { data: { items: [], pagination: { total: 0 } } } }),
      ]);

      const totalBarang = barangRes.data.data?.pagination?.total || 0;
      const totalAsetMasuk = asetMasukRes.data.data?.pagination?.total || 0;
      const totalAsetKeluar = asetKeluarRes.data.data?.pagination?.total || 0;
      const totalHabisPakaiMasuk = habisPakaiMasukRes.data.data?.pagination?.total || 0;
      const totalHabisPakaiKeluar = habisPakaiKeluarRes.data.data?.pagination?.total || 0;

      // Combine recent activities
      const activities = [];
      
      // Add aset masuk
      (asetMasukRes.data.data?.items || []).slice(0, 3).forEach(item => {
        const summary = summarizeAsetMutation(item);
        activities.push({
          type: 'masuk',
          category: 'Aset',
          barang: summary.barang,
          jumlah: summary.jumlah,
          satuan: summary.satuan,
          date: item.created_at,
        });
      });

      // Add aset keluar
      (asetKeluarRes.data.data?.items || []).slice(0, 2).forEach(item => {
        const summary = summarizeAsetMutation(item);
        activities.push({
          type: 'keluar',
          category: 'Aset',
          barang: summary.barang,
          jumlah: summary.jumlah,
          satuan: summary.satuan,
          tujuan: summary.keterangan,
          date: item.created_at,
        });
      });

      // Sort by date
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));

      setStats({
        totalBarang,
        barangMasuk: totalAsetMasuk + totalHabisPakaiMasuk,
        barangKeluar: totalAsetKeluar + totalHabisPakaiKeluar,
        stokTersedia: totalBarang,
      });

      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setStats({
        totalBarang: 0,
        barangMasuk: 0,
        barangKeluar: 0,
        stokTersedia: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statsCards = [
    {
      title: 'Total Barang',
      value: stats.totalBarang,
      icon: Package,
      gradient: 'from-primary-500 to-primary-700',
      bgLight: 'bg-primary-50',
      bgDark: 'dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
      change: null,
    },
    {
      title: 'Barang Masuk',
      value: stats.barangMasuk,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-700',
      bgLight: 'bg-green-50',
      bgDark: 'dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      change: '+12% bulan ini',
    },
    {
      title: 'Barang Keluar',
      value: stats.barangKeluar,
      icon: TrendingDown,
      gradient: 'from-orange-500 to-orange-700',
      bgLight: 'bg-orange-50',
      bgDark: 'dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      change: '+8% bulan ini',
    },
    {
      title: 'Stok Tersedia',
      value: stats.stokTersedia,
      icon: Archive,
      gradient: 'from-purple-500 to-purple-700',
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      change: null,
    },
  ];

  // Shortcut untuk petugas
  const quickActions = [
    { title: 'Tambah Barang', icon: Plus, path: '/barang', gradient: 'from-primary-500 to-primary-700' },
    { title: 'Aset Masuk', icon: TrendingUp, path: '/aset/masuk', gradient: 'from-green-500 to-green-700' },
    { title: 'Aset Keluar', icon: TrendingDown, path: '/aset/keluar', gradient: 'from-orange-500 to-orange-700' },
    { title: 'Habis Pakai Masuk', icon: TrendingUp, path: '/habis-pakai/masuk', gradient: 'from-purple-500 to-purple-700' },
  ];

  if (loading) {
    return <Loading text="Memuat dashboard..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-accent-600 dark:text-accent-400 mt-1">Selamat datang di sistem inventaris</p>
        </div>
        {isAdmin() && (
          <Button 
            onClick={() => navigate('/laporan')} 
            icon={ArrowRight}
            className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
          >
            Lihat Laporan
          </Button>
        )}
      </div>
      
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsCards.map((stat) => (
          <div 
            key={stat.title} 
            className={`${stat.bgLight} ${stat.bgDark} dark:bg-accent-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-accent-200 dark:border-accent-700 group hover:scale-105`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-accent-600 dark:text-accent-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2 truncate">{stat.title}</p>
                <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.textColor} mb-1`}>
                  {stat.value}
                </p>
                {stat.change && (
                  <p className="text-xs text-accent-500 dark:text-accent-400 font-medium mt-1 sm:mt-2 flex items-center gap-1">
                    <Activity size={12} />
                    <span className="truncate">{stat.change}</span>
                  </p>
                )}
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} p-3 sm:p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                <stat.icon size={24} className="text-white sm:w-7 sm:h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions untuk Petugas - Better Mobile */}
      {!isAdmin() && (
        <div className="animate-slide-up">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-accent-800 dark:text-accent-200 mb-3 sm:mb-4 flex items-center gap-2">
            <Activity className="text-primary-600 dark:text-primary-400" size={20} />
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="bg-white dark:bg-accent-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 text-center group hover:scale-105 border border-accent-200 dark:border-accent-700"
              >
                <div className={`bg-gradient-to-br ${action.gradient} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:rotate-6 transition-transform`}>
                  <action.icon size={24} className="text-white sm:w-7 sm:h-7" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-accent-800 dark:text-accent-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                  {action.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: Aktivitas & Stok - Stack on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Aktivitas Terbaru */}
        <div className="bg-white dark:bg-accent-800 rounded-xl shadow-md border border-accent-200 dark:border-accent-700 p-4 sm:p-6 animate-slide-up">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-accent-800 dark:text-accent-200 flex items-center gap-2">
              <Activity className="text-primary-600 dark:text-primary-400" size={18} />
              <span className="truncate">Aktivitas Terbaru</span>
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-100 dark:bg-accent-900/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Activity className="text-accent-400 dark:text-accent-600" size={24} />
                </div>
                <p className="text-sm sm:text-base text-accent-500 dark:text-accent-400 font-medium">Belum ada aktivitas</p>
                <p className="text-xs text-accent-400 dark:text-accent-500 mt-1">Aktivitas akan muncul di sini</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={`${activity.date}-${activity.barang}-${index}`} className="flex items-start gap-3 p-3 bg-accent-50 dark:bg-accent-900/50 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'masuk'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    {activity.type === 'masuk' ? (
                      <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                    ) : (
                      <TrendingDown className="text-orange-600 dark:text-orange-400" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-accent-800 dark:text-accent-200 truncate">
                      {activity.category} {activity.type === 'masuk' ? 'Masuk' : 'Keluar'}
                    </p>
                    <p className="text-xs text-accent-600 dark:text-accent-400 truncate">
                      {activity.barang} - {activity.jumlah} {activity.satuan}
                    </p>
                    {activity.tujuan && (
                      <p className="text-xs text-accent-500 dark:text-accent-500 truncate">
                        Tujuan: {activity.tujuan}
                      </p>
                    )}
                    <p className="text-xs text-accent-400 dark:text-accent-500 mt-1">
                      {new Date(activity.date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
