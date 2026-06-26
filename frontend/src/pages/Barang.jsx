import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import axiosInstance from '../services/axios';
import Button from '../components/Button';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';

// Validation Schema
const barangSchema = z.object({
  nama_barang: z.string().min(1, 'Nama barang wajib diisi'),
  jenis_barang: z.enum(['ASET', 'HABIS_PAKAI'], { required_error: 'Jenis wajib dipilih' }),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  satuan: z.string().min(1, 'Satuan wajib diisi'),
  keterangan: z.string().optional(),
});

const Barang = () => {
  const [loading, setLoading] = useState(true);
  const [barangList, setBarangList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(barangSchema),
  });

  const fetchBarang = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (filterJenis) params.jenis_barang = filterJenis;
      if (filterKategori) params.kategori = filterKategori;

      const response = await axiosInstance.get('/barang', { params });
      
      if (response.data && response.data.success) {
        const items = response.data.data?.items || [];
        const paginationData = response.data.data?.pagination || {
          total: 0,
          totalPages: 0,
          page: 1,
          limit: 10
        };
        
        setBarangList(items);
        setPagination(prev => ({
          ...prev,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 0,
          page: paginationData.page || prev.page,
        }));
      } else {
        setBarangList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching barang:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      setBarangList([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0,
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterJenis, filterKategori]);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Reset ke halaman 1 saat search berubah
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleAdd = () => {
    setEditingBarang(null);
    reset({
      nama_barang: '',
      jenis_barang: 'ASET',
      kategori: '',
      satuan: '',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (barang) => {
    setEditingBarang(barang);
    setValue('nama_barang', barang.nama_barang);
    setValue('jenis_barang', barang.jenis_barang);
    setValue('kategori', barang.kategori);
    setValue('satuan', barang.satuan);
    setValue('keterangan', barang.keterangan || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (kode_barang) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/barang/${kode_barang}`);
      
      if (response.data && response.data.success) {
        toast.success('Barang berhasil dihapus');
        fetchBarang();
      } else {
        toast.error(response.data?.message || 'Gagal menghapus barang');
      }
    } catch (error) {
      console.error('Error deleting barang:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menghapus barang';
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      if (editingBarang) {
        // Update
        const response = await axiosInstance.put(`/barang/${editingBarang.kode_barang}`, data);
        
        if (response.data && response.data.success) {
          toast.success('Barang berhasil diupdate');
          setIsModalOpen(false);
          reset();
          fetchBarang();
        } else {
          toast.error(response.data?.message || 'Gagal mengupdate barang');
        }
      } else {
        // Create
        const response = await axiosInstance.post('/barang', data);
        
        if (response.data && response.data.success) {
          toast.success('Barang berhasil ditambahkan');
          setIsModalOpen(false);
          reset();
          fetchBarang();
        } else {
          toast.error(response.data?.message || 'Gagal menambahkan barang');
        }
      }
    } catch (error) {
      console.error('Error saving barang:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan barang';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Data Barang
          </h1>
          <p className="text-xs sm:text-sm text-accent-600 dark:text-accent-400 mt-1">Kelola data barang inventaris</p>
        </div>
        <Button onClick={handleAdd} icon={Plus} className="w-full sm:w-auto">
          Tambah Barang
        </Button>
      </div>

      <div className="bg-white dark:bg-accent-800 rounded-xl shadow-md border border-accent-200 dark:border-accent-700 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-accent-200 dark:border-accent-700 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400 dark:text-accent-500" size={20} />
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-accent-900 dark:text-accent-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              icon={Filter}
            >
              Filter
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-accent-200 dark:border-accent-700 animate-slide-down">
              <select
                value={filterJenis}
                onChange={(e) => {
                  setFilterJenis(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2.5 border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-accent-900 dark:text-accent-100 rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <option value="">Semua Jenis</option>
                <option value="ASET">Aset</option>
                <option value="HABIS_PAKAI">Habis Pakai</option>
              </select>
              
              <input
                type="text"
                placeholder="Filter kategori..."
                value={filterKategori}
                onChange={(e) => {
                  setFilterKategori(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2.5 border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-accent-900 dark:text-accent-100 rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <Loading />
        ) : barangList.length === 0 ? (
          <EmptyState 
            title="Tidak ada barang"
            description={searchTerm ? "Tidak ditemukan barang dengan pencarian tersebut" : "Belum ada data barang"}
            action={!searchTerm && <Button onClick={handleAdd} icon={Plus}>Tambah Barang</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-50 dark:bg-accent-900/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                      Nama Barang
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                      Satuan
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-accent-800 divide-y divide-accent-200 dark:divide-accent-700">
                  {barangList.map((barang) => (
                    <tr key={barang.id} className="hover:bg-accent-50 dark:hover:bg-accent-900/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-700 dark:text-accent-300 font-mono">
                        {barang.kode_barang}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-accent-900 dark:text-accent-100">
                        {barang.nama_barang}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          barang.jenis_barang === 'ASET' 
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                          {barang.jenis_barang === 'ASET' ? 'Aset' : 'Habis Pakai'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-700 dark:text-accent-300">
                        {barang.kategori}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-700 dark:text-accent-300">
                        {barang.satuan}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(barang)}
                            className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(barang.kode_barang)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBarang ? 'Edit Barang' : 'Tambah Barang'}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label="Nama Barang"
            required
            {...register('nama_barang')}
            error={errors.nama_barang?.message}
          />

          <FormInput
            label="Jenis"
            type="select"
            required
            {...register('jenis_barang')}
            error={errors.jenis_barang?.message}
          >
            <option value="">Pilih Jenis</option>
            <option value="ASET">Aset</option>
            <option value="HABIS_PAKAI">Habis Pakai</option>
          </FormInput>

          <FormInput
            label="Kategori"
            required
            {...register('kategori')}
            error={errors.kategori?.message}
            placeholder="Contoh: Elektronik, Furniture, ATK"
          />

          <FormInput
            label="Satuan"
            required
            {...register('satuan')}
            error={errors.satuan?.message}
            placeholder="Contoh: Unit, Pcs, Box"
          />

          <FormInput
            label="Keterangan"
            type="textarea"
            {...register('keterangan')}
            error={errors.keterangan?.message}
          />

          <div className="flex gap-3 justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={submitting}
            >
              {editingBarang ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Barang;
