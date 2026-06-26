import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../services/axios';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const AsetKeluar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [asetList, setAsetList] = useState([]);
  const [filteredAset, setFilteredAset] = useState([]);
  const [barangOptions, setBarangOptions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const [formData, setFormData] = useState({
    barang_id: '',
    jumlah_unit: 1,
    tujuan: '',
    keterangan: '',
  });

  const fetchBarangOptions = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/barang', {
        params: { jenis_barang: 'ASET', limit: 100 },
      });
      const items = response.data?.data?.items || [];
      setBarangOptions(items);
    } catch (error) {
      console.error('Error fetching barang options:', error);
      toast.error('Gagal memuat daftar barang');
    }
  }, []);

  const fetchAset = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/aset/keluar', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      const rawItems = response.data?.data?.items || [];
      const paginationData = response.data?.data?.pagination || {
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
      };

      // Transform nested API response to flat structure
      const transformedItems = rawItems.map(mutasi => {
        const detail = mutasi.mutasi_detail_aset?.[0];
        const unitAset = detail?.unit_aset;
        const penerimaanAset = unitAset?.penerimaan_aset;
        const barang = penerimaanAset?.barang;

        return {
          id: mutasi.id,
          tanggal: mutasi.tanggal,
          created_at: mutasi.created_at,
          keterangan: mutasi.keterangan,
          user: mutasi.users?.nama || mutasi.users?.username,
          barang: {
            id: barang?.id,
            kode_barang: barang?.kode_barang || '-',
            nama_barang: barang?.nama_barang || '-',
            kategori: barang?.kategori || '-',
            merk: barang?.merk || '-',
            satuan: barang?.satuan || 'unit',
          },
          jumlah_unit: mutasi.mutasi_detail_aset?.length || 0,
          _original: mutasi
        };
      });

      setAsetList(transformedItems);
      setFilteredAset(transformedItems);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching aset keluar:', error);
      toast.error('Gagal memuat data aset keluar');
      setAsetList([]);
      setFilteredAset([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchBarangOptions();
  }, [fetchBarangOptions]);

  useEffect(() => {
    fetchAset();
  }, [pagination.page, pagination.limit, fetchAset]);

  useEffect(() => {
    const filtered = asetList.filter(item =>
      item.barang?.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barang?.kode_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
    setFilteredAset(filtered);
  }, [searchTerm, asetList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.barang_id || formData.barang_id === '') {
      toast.error('Pilih barang terlebih dahulu');
      return;
    }
    
    if (!formData.jumlah_unit || formData.jumlah_unit < 1) {
      toast.error('Jumlah unit minimal 1');
      return;
    }
    
    setIsLoading(true);

    try {
      if (editMode) {
        const response = await axiosInstance.put(`/aset/keluar/${editId}`, {
          keterangan: formData.keterangan || '',
        });
        if (response.data && response.data.success) {
          toast.success('Aset keluar berhasil diperbarui');
          setIsModalOpen(false);
          resetForm();
          fetchAset();
        } else {
          toast.error(response.data?.message || 'Gagal memperbarui aset keluar');
        }
      } else {
        const payload = {
          barang_id: formData.barang_id,
          jumlah_unit: parseInt(formData.jumlah_unit, 10),
          tujuan: formData.tujuan || '',
          keterangan: formData.keterangan || '',
        };
        const response = await axiosInstance.post('/aset/keluar', payload);
        if (response.data && response.data.success) {
          toast.success('Aset keluar berhasil dicatat');
          setIsModalOpen(false);
          resetForm();
          fetchAset();
        } else {
          toast.error(response.data?.message || 'Gagal mencatat aset keluar');
        }
      }
    } catch (error) {
      console.error('Error saving aset keluar:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      barang_id: '',
      jumlah_unit: 1,
      tujuan: '',
      keterangan: '',
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleEdit = (item) => {
    setFormData({
      barang_id: item.barang?.id || '',
      jumlah_unit: item.jumlah_unit || 1,
      tujuan: '',
      keterangan: item.keterangan || '',
    });
    setEditMode(true);
    setEditId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Yakin ingin menghapus transaksi aset keluar?\n\nUnit akan dikembalikan ke status AKTIF.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.delete(`/aset/keluar/${item.id}`);
      toast.success('Transaksi berhasil dihapus, unit dikembalikan');
      fetchAset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-accent-800 dark:text-accent-100">Aset Keluar</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
        >
          <Plus size={20} />
          Tambah Aset Keluar
        </Button>
      </div>

      <div className="bg-white dark:bg-accent-800 rounded-lg shadow">
        <div className="p-4 border-b border-accent-200 dark:border-accent-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
            <input
              type="text"
              placeholder="Cari barang, kode, atau tujuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-accent-900 dark:text-accent-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : filteredAset.length === 0 ? (
          <EmptyState
            title="Belum ada data aset keluar"
            description="Klik tombol Tambah Aset Keluar untuk mencatat pengeluaran aset"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-50 dark:bg-accent-900">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Kode</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Barang</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Jumlah</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Keterangan</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-accent-800 divide-y divide-accent-200 dark:divide-accent-700">
                  {filteredAset.map((item) => (
                    <tr key={item.id} className="hover:bg-accent-50 dark:hover:bg-accent-700">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-900 dark:text-accent-100">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-accent-900 dark:text-accent-100">
                        {item.barang?.kode_barang}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-accent-900 dark:text-accent-100">
                        <div className="font-medium">{item.barang?.nama_barang}</div>
                        <div className="text-accent-500 dark:text-accent-400 text-xs">{item.barang?.kategori}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-900 dark:text-accent-100">
                        {item.jumlah_unit} {item.barang?.satuan}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-accent-500 dark:text-accent-400">
                        {item.keterangan || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900 transition-colors"
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
            
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-accent-200 dark:border-accent-700">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editMode ? 'Edit Aset Keluar' : 'Tambah Aset Keluar'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Pilih Barang"
            name="barang_id"
            type="select"
            value={formData.barang_id}
            onChange={handleChange}
            options={[
              { value: '', label: '-- Pilih Barang --' },
              ...barangOptions.map(item => ({
                value: item.id,
                label: `${item.kode_barang} - ${item.nama_barang}`
              }))
            ]}
            required
          />
          
          <FormInput
            label="Jumlah Unit"
            name="jumlah_unit"
            type="number"
            value={formData.jumlah_unit}
            onChange={handleChange}
            min="1"
            required
          />
          
          <FormInput
            label="Tujuan"
            name="tujuan"
            value={formData.tujuan}
            onChange={handleChange}
            placeholder="Contoh: Unit Rawat Inap"
            required
          />
          
          <FormInput
            label="Keterangan"
            name="keterangan"
            type="textarea"
            value={formData.keterangan}
            onChange={handleChange}
            placeholder="Keterangan tambahan (opsional)"
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AsetKeluar;
