import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Plus, Edit2, Trash2, Key, Search, Filter } from 'lucide-react';
import axios from '../services/axios';
import { toast } from 'react-toastify';
import { createUserSchema, updateUserSchema, resetPasswordSchema } from '../utils/validationSchemas';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const editModeRef = useRef(false);

  // Form for Create/Edit User
  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    formState: { errors: userErrors },
    reset: resetUserForm,
    setValue: setUserValue,
  } = useForm({
    resolver: async (values, context, options) => {
      const schema = editModeRef.current ? updateUserSchema : createUserSchema;
      return zodResolver(schema)(values, context, options);
    },
    defaultValues: {
      username: '',
      password: '',
      nama: '',
      role: 'PETUGAS',
      is_active: true,
    },
  });

  // Form for Reset Password
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
    reset: resetResetForm,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const response = await axios.get('/users', { params });
      setUsers(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmitUserForm = async (data) => {
    try {
      if (editMode) {
        await axios.put(`/users/${selectedUser.id}`, {
          username: data.username,
          nama: data.nama,
          role: data.role,
          is_active: data.is_active,
        });
        toast.success('Pengguna berhasil diperbarui');
      } else {
        await axios.post('/users', data);
        toast.success('Pengguna berhasil ditambahkan');
      }
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error('Error saving user:', error);
      const message = error.response?.data?.message || 'Gagal menyimpan pengguna';
      toast.error(message);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setUserValue('username', user.username);
    setUserValue('nama', user.nama);
    setUserValue('role', user.role);
    setUserValue('is_active', user.is_active);
    editModeRef.current = true;
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.nama}"?`)) {
      return;
    }

    try {
      await axios.delete(`/users/${user.id}`);
      toast.success('Pengguna berhasil dihapus');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      const message = error.response?.data?.message || 'Gagal menghapus pengguna';
      toast.error(message);
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const handleSubmitResetPasswordForm = async (data) => {
    try {
      await axios.post(`/users/${selectedUser.id}/reset-password`, {
        newPassword: data.newPassword,
      });
      toast.success('Password berhasil direset');
      setShowResetModal(false);
      resetResetForm();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Gagal mereset password');
    }
  };

  const closeModal = () => {
    resetUserForm();
    editModeRef.current = false;
    setEditMode(false);
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-accent-800 dark:text-white">Manajemen Pengguna</h1>
          <p className="text-xs sm:text-sm text-accent-500 dark:text-accent-400 mt-1">Kelola akun pengguna sistem</p>
        </div>
        <button
          onClick={() => { closeModal(); setShowModal(true); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-accent-800 rounded-xl shadow-sm border border-accent-200 dark:border-accent-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari username atau nama..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-accent-900 dark:text-white placeholder:text-accent-400 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-400 w-4 h-4" />
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
            >
              <option value="">Semua Role</option>
              <option value="ADMIN">Admin</option>
              <option value="PETUGAS">Petugas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-accent-800 rounded-xl shadow-sm border border-accent-200 dark:border-accent-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent-200 dark:divide-accent-700">
            <thead className="bg-accent-50 dark:bg-accent-900">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-500 dark:text-accent-400 uppercase tracking-wider">No</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-500 dark:text-accent-400 uppercase tracking-wider">Username</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-500 dark:text-accent-400 uppercase tracking-wider">Nama</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-500 dark:text-accent-400 uppercase tracking-wider">Role</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-500 dark:text-accent-400 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-500 dark:text-accent-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-100 dark:divide-accent-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-accent-400 dark:text-accent-500 text-sm">
                    Tidak ada data pengguna
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-accent-50 dark:hover:bg-accent-700/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-accent-600 dark:text-accent-300">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-accent-800 dark:text-accent-100">
                      {user.username}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-accent-700 dark:text-accent-300">
                      {user.nama}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                      }`}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(user)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleResetPassword(user)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors" title="Reset Password">
                          <Key className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-accent-200 dark:border-accent-700">
            <p className="text-sm text-accent-500 dark:text-accent-400">
              Halaman {pagination.page} dari {pagination.totalPages} &middot; {pagination.total} pengguna
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-sm border border-accent-300 dark:border-accent-600 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-accent-700 dark:text-accent-300 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 text-sm border border-accent-300 dark:border-accent-600 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-accent-700 dark:text-accent-300 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-accent-800 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-lg font-bold text-accent-800 dark:text-white mb-5">
              {editMode ? 'Edit Pengguna' : 'Tambah Pengguna'}
            </h2>
            <form onSubmit={handleSubmitUser(handleSubmitUserForm)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerUser('username')}
                  className="w-full px-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
                />
                {userErrors.username && (
                  <p className="mt-1 text-xs text-red-500">{userErrors.username.message}</p>
                )}
              </div>

              {!editMode && (
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    {...registerUser('password')}
                    className="w-full px-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
                    placeholder="Minimal 6 karakter"
                  />
                  {userErrors.password && (
                    <p className="mt-1 text-xs text-red-500">{userErrors.password.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerUser('nama')}
                  className="w-full px-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
                />
                {userErrors.nama && (
                  <p className="mt-1 text-xs text-red-500">{userErrors.nama.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerUser('role')}
                  className="w-full px-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
                >
                  <option value="PETUGAS">Petugas</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {userErrors.role && (
                  <p className="mt-1 text-xs text-red-500">{userErrors.role.message}</p>
                )}
              </div>

              {editMode && (
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
                    Status
                  </label>
                  <select
                    {...registerUser('is_active', {
                      setValueAs: (v) => v === 'true',
                    })}
                    className="w-full px-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-accent-300 dark:border-accent-600 text-accent-700 dark:text-accent-300 rounded-xl text-sm font-medium hover:bg-accent-50 dark:hover:bg-accent-700 transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors">
                  {editMode ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-accent-800 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-accent-800 dark:text-white mb-5">
              Reset Password — {selectedUser?.nama}
            </h2>
            <form onSubmit={handleSubmitReset(handleSubmitResetPasswordForm)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  {...registerReset('newPassword')}
                  className="w-full px-4 py-2.5 border border-accent-300 dark:border-accent-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:bg-accent-900 dark:text-white transition-colors"
                  placeholder="Minimal 6 karakter"
                />
                {resetErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-500">{resetErrors.newPassword.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    resetResetForm();
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-2.5 border border-accent-300 dark:border-accent-600 text-accent-700 dark:text-accent-300 rounded-xl text-sm font-medium hover:bg-accent-50 dark:hover:bg-accent-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
