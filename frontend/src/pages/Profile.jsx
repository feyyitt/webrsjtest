import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Save } from 'lucide-react';
import axios from '../services/axios';
import { toast } from 'react-toastify';
import { changePasswordSchema } from '../utils/validationSchemas';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/auth/me');
      setProfile(response.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    setIsChangingPassword(true);
    try {
      await axios.post('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      toast.success('Password berhasil diubah');
      reset();
    } catch (error) {
      console.error('Error changing password:', error);
      const message = error.response?.data?.message || 'Gagal mengubah password';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-accent-800 dark:text-white">Profil</h1>
        <p className="text-xs sm:text-sm text-accent-500 dark:text-accent-400 mt-1">Informasi akun dan pengaturan password</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-accent-800 rounded-xl shadow-sm border border-accent-200 dark:border-accent-700 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-accent-800 dark:text-white">Informasi Akun</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-1.5">Username</label>
            <div className="px-4 py-2.5 bg-accent-50 dark:bg-accent-900 border border-accent-200 dark:border-accent-700 rounded-xl text-sm text-accent-800 dark:text-accent-200">
              {profile?.username}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
            <div className="px-4 py-2.5 bg-accent-50 dark:bg-accent-900 border border-accent-200 dark:border-accent-700 rounded-xl text-sm text-accent-800 dark:text-accent-200">
              {profile?.nama}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-1.5">Role</label>
            <div className="px-4 py-2.5 bg-accent-50 dark:bg-accent-900 border border-accent-200 dark:border-accent-700 rounded-xl text-sm">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                profile?.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                  : 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
              }`}>
                {profile?.role}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-1.5">Tanggal Dibuat</label>
            <div className="px-4 py-2.5 bg-accent-50 dark:bg-accent-900 border border-accent-200 dark:border-accent-700 rounded-xl text-sm text-accent-800 dark:text-accent-200">
              {new Date(profile?.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-accent-800 rounded-xl shadow-sm border border-accent-200 dark:border-accent-700 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-700 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-accent-600 dark:text-accent-300" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-accent-800 dark:text-white">Ubah Password</h2>
        </div>

        <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
              Password Lama <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              {...register('oldPassword')}
              className="w-full px-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
              placeholder="Masukkan password lama"
            />
            {errors.oldPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.oldPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
              Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              {...register('newPassword')}
              className="w-full px-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
              placeholder="Minimal 6 karakter"
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
              Konfirmasi Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full px-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
              placeholder="Ketik ulang password baru"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isChangingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}
