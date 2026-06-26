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

const HabisPakaiMasuk = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const [formData, setFormData] = useState({
    nama_barang: '',
    kategori: '',
    merk: '',
    jumlah_masuk: 1,
    harga_satuan: '0',
    keterangan: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/habis-pakai/masuk', {
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

      // Transform nested API response to flat structure for table
      const transformedItems = rawItems.map(mutasi => {
        // Get first detail
        const detail = mutasi.mutasi_detail_habis_pakai?.[0];
        const batch = detail?.batch_habis_pakai;
        const barang = batch?.barang;

        return {
          id: mutasi.id,
          tanggal: mutasi.tanggal,
          created_at: mutasi.created_at,
          keterangan: mutasi.keterangan,
          user: mutasi.users?.nama || mutasi.users?.username,
          
          // From barang
          kode_barang: barang?.kode_barang || '-',
          nama_barang: barang?.nama_barang || '-',
          kategori: barang?.kategori || '-',
          merk: barang?.merk || '-',
          satuan: barang?.satuan || 'unit',
          
          // From batch
          kode_batch: batch?.kode_batch || '-',
          expired_date: batch?.expired_date,
          jumlah_masuk: batch?.jumlah_masuk || 0,
          harga_satuan: batch?.harga_satuan || 0,
          
          // Keep original nested data
          _original: mutasi
        };
      });

      setDataList(transformedItems);
      setFilteredData(transformedItems);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data barang masuk');
      setDataList([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const filtered = dataList.filter(item =>
      item.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, dataList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        nama_barang: formData.nama_barang,
        kategori: formData.kategori,
        merk: formData.merk,
        jumlah_masuk: Number(formData.jumlah_masuk),
        harga_satuan: parseCurrencyInput(formData.harga_satuan),
        keterangan: formData.keterangan,
      };

      if (editMode) {
        const response = await axiosInstance.put(`/habis-pakai/masuk/${editId}`, payload);
        if (response.data && response.data.success) {
          toast.success('Barang habis pakai masuk berhasil diperbarui');
          setIsModalOpen(false);
          resetForm();
          fetchData();
        }
      } else {
        const response = await axiosInstance.post('/habis-pakai/masuk', payload);
        if (response.data && response.data.success) {
          toast.success('Barang habis pakai masuk berhasil ditambahkan');
          setIsModalOpen(false);
          resetForm();
          fetchData();
        }
      }
    } catch (error) {
      console.error('Error saving data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_barang: '',
      kategori: '',
      merk: '',
      jumlah_masuk: 1,
      harga_satuan: '0',
      keterangan: '',
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrencyInput = (value) => {
    // Convert to string first
    const stringValue = String(value || '');
    // Hapus semua karakter non-digit
    const numericValue = stringValue.replace(/\D/g, '');
    // Jika kosong, return '0'
    if (!numericValue) return '0';
    // Format dengan titik pemisah ribuan
    return numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  const parseCurrencyInput = (value) => {
    // Handle berbagai tipe input dengan defensive check
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return Math.floor(value);
    if (typeof value !== 'string') {
      // Convert apapun ke string dulu
      value = String(value);
    }
    if (value === '' || value === '0') return 0;
    
    // Hapus titik pemisah ribuan dan parse ke integer
    const cleaned = value.replace(/\./g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    const formatted = formatCurrencyInput(value);
    setFormData(prev => ({ ...prev, [name]: formatted }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
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
      nama_barang: item.nama_barang || '',
      kategori: item.kategori || '',
      merk: item.merk || '',
      jumlah_masuk: item.jumlah_masuk || 1,
      harga_satuan: formatCurrencyInput(String(item.harga_satuan || 0)),
      keterangan: item.keterangan || '',
    });
    setEditMode(true);
    setEditId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Yakin ingin menghapus transaksi habis pakai masuk "${item.nama_barang}" sebanyak ${item.jumlah_masuk} ${item.satuan}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.delete(`/habis-pakai/masuk/${item.id}`);
      
      if (response.data && response.data.success) {
        toast.success('Transaksi habis pakai masuk berhasil dihapus');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus transaksi';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-accent-800 dark:text-accent-100">Barang Habis Pakai - Masuk</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus size={20} />
          Tambah Barang Masuk
        </Button>
      </div>

      <div className="bg-white dark:bg-accent-800 rounded-lg shadow">
        <div className="p-4 border-b border-accent-200 dark:border-accent-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
            <input
              type="text"
              placeholder="Cari barang atau kategori..."
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
        ) : filteredData.length === 0 ? (
          <EmptyState
            title="Belum ada data barang masuk"
            description="Klik tombol Tambah Barang Masuk untuk mencatat penerimaan barang habis pakai"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-50 dark:bg-accent-900">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Barang</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Jumlah</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Harga Satuan</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Harga Total</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-accent-800 divide-y divide-accent-200 dark:divide-accent-700">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-accent-50 dark:hover:bg-accent-700">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-900 dark:text-accent-100">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-accent-900 dark:text-accent-100">
                        <div className="font-medium">{item.nama_barang}</div>
                        <div className="text-accent-500 dark:text-accent-400 text-xs">{item.kategori} {item.merk ? `- ${item.merk}` : ''}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-900 dark:text-accent-100">
                        {item.jumlah_masuk} {item.satuan}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right text-accent-900 dark:text-accent-100">
                        {formatCurrency(item.harga_satuan)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-primary-600 dark:text-primary-400">
                        {formatCurrency(item.harga_satuan * item.jumlah_masuk)}
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
        title="Tambah Barang Habis Pakai Masuk"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nama Barang"
              name="nama_barang"
              value={formData.nama_barang}
              onChange={handleChange}
              placeholder="Contoh: Masker N95"
              required
            />
            
            <FormInput
              label="Kategori"
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              placeholder="Contoh: APD"
              required
            />
            
            <FormInput
              label="Merk"
              name="merk"
              value={formData.merk}
              onChange={handleChange}
              placeholder="Contoh: 3M"
            />
            
            <FormInput
              label="Jumlah Masuk"
              name="jumlah_masuk"
              type="number"
              value={formData.jumlah_masuk}
              onChange={handleChange}
              min="1"
              required
            />
            
            <FormInput
              label="Harga Satuan (Rp)"
              name="harga_satuan"
              type="text"
              value={formData.harga_satuan}
              onChange={handleCurrencyChange}
              placeholder="Contoh: 20.000"
              required
            />
          </div>
          
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
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HabisPakaiMasuk;
