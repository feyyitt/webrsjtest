import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../services/axios';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const AsetMasuk = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [qrImages, setQrImages] = useState({}); // Store QR as base64
  const [isLoading, setIsLoading] = useState(false);
  const [asetList, setAsetList] = useState([]);
  const [filteredAset, setFilteredAset] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const [formData, setFormData] = useState({
    kode_barang: '',
    nama_barang: '',
    kategori: '',
    merk: '',
    tahun_masuk: new Date().getFullYear(),
    jumlah_unit: 1,
    harga_satuan: '0',
    keterangan: '',
  });

  const fetchAset = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/aset/masuk', {
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
        // Get first detail (mutasi can have multiple units)
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
          
          // From barang
          kode_barang: barang?.kode_barang || '-',
          nama_barang: barang?.nama_barang || '-',
          kategori: barang?.kategori || '-',
          merk: barang?.merk || '-',
          satuan: barang?.satuan || 'unit',
          
          // From penerimaan_aset
          jumlah_unit: penerimaanAset?.jumlah_unit || 0,
          harga_satuan: penerimaanAset?.harga_satuan || 0,
          tahun_masuk: penerimaanAset?.tahun_masuk || new Date().getFullYear(),
          
          // Keep original nested data for detail view
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
      console.error('Error fetching aset:', error);
      toast.error('Gagal memuat data aset masuk');
      setAsetList([]);
      setFilteredAset([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchAset();
  }, [fetchAset]);

  useEffect(() => {
    const filtered = asetList.filter(item =>
      item.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAset(filtered);
  }, [searchTerm, asetList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        kode_barang: formData.kode_barang,
        nama_barang: formData.nama_barang,
        kategori: formData.kategori,
        merk: formData.merk,
        tahun_masuk: Number(formData.tahun_masuk),
        jumlah_unit: Number(formData.jumlah_unit),
        harga_satuan: parseCurrencyInput(formData.harga_satuan),
        keterangan: formData.keterangan,
      };

      if (editMode) {
        // Update mode
        const response = await axiosInstance.put(`/aset/masuk/${editId}`, payload);
        if (response.data && response.data.success) {
          toast.success('Aset masuk berhasil diperbarui');
          setIsModalOpen(false);
          resetForm();
          fetchAset();
        }
      } else {
        // Create mode
        const response = await axiosInstance.post('/aset/masuk', payload);
        if (response.data && response.data.success) {
          toast.success('Aset masuk berhasil ditambahkan');
          setIsModalOpen(false);
          resetForm();
          fetchAset();
        }
      }
    } catch (error) {
      console.error('Error saving aset:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      kode_barang: '',
      nama_barang: '',
      kategori: '',
      merk: '',
      tahun_masuk: new Date().getFullYear(),
      jumlah_unit: 1,
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
      kode_barang: item.kode_barang || '',
      nama_barang: item.nama_barang || '',
      kategori: item.kategori || '',
      merk: item.merk || '',
      tahun_masuk: item.tahun_masuk || new Date().getFullYear(),
      jumlah_unit: item.jumlah_unit || 1,
      harga_satuan: formatCurrencyInput(String(item.harga_satuan || 0)),
      keterangan: item.keterangan || '',
    });
    setEditMode(true);
    setEditId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Yakin ingin menghapus transaksi aset masuk "${item.nama_barang}"?\n\nPeringatan: Unit aset yang sudah keluar tidak dapat dihapus.`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.delete(`/aset/masuk/${item.id}`);
      
      if (response.data && response.data.success) {
        toast.success('Transaksi aset masuk berhasil dihapus');
        fetchAset();
      }
    } catch (error) {
      console.error('Error deleting aset:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus transaksi';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUnits = async (item) => {
    try {
      setIsLoading(true);
      setQrImages({});

      const response = await axiosInstance.get(
        `/aset/barang/${encodeURIComponent(item.kode_barang)}/units`
      );
      const barang = response.data?.data?.barang || {};
      const unitsData = response.data?.data?.units || [];

      if (unitsData.length === 0) {
        toast.error('Tidak ada unit untuk barang ini');
        return;
      }

      setSelectedUnits(unitsData);
      setSelectedBarang({
        kode_barang: barang.kode_barang || item.kode_barang,
        nama_barang: barang.nama_barang || item.nama_barang,
        kategori: barang.kategori || item.kategori,
        merk: barang.merk || item.merk,
      });
      setIsQRModalOpen(true);

      await loadQRCodes(unitsData);
    } catch (error) {
      console.error('Error loading units for QR:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat unit aset');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQRCodes = async (units) => {
    const images = {};
    
    for (const unit of units) {
      if (!unit.kode_unit) {
        console.warn('Kode unit kosong, skip QR generation');
        images[unit.kode_unit] = null;
        continue;
      }

      try {
        const response = await axiosInstance.get(`/aset/unit/${unit.kode_unit}/qr`, {
          responseType: 'arraybuffer'
        });
        
        // Convert arraybuffer to base64 - Method yang lebih robust
        const blob = new Blob([response.data], { type: 'image/png' });
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        images[unit.kode_unit] = base64;
      } catch (error) {
        console.error(`Error loading QR for ${unit.kode_unit}:`, error);
        console.error('Error details:', error.response);
        images[unit.kode_unit] = null;
      }
    }
    
    setQrImages(images);
  };

  const handleDownloadQR = (kode_unit) => {
    // Use the loaded base64 image
    const base64Image = qrImages[kode_unit];
    
    if (!base64Image) {
      toast.error('QR Code belum dimuat');
      return;
    }
    
    // Create link and trigger download
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = `QR-${kode_unit}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`QR Code ${kode_unit} berhasil didownload`);
  };

  const handlePrintQR = (kode_unit) => {
    const base64Image = qrImages[kode_unit];
    
    if (!base64Image) {
      toast.error('QR Code belum dimuat');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${kode_unit}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .print-container {
              text-align: center;
              padding: 20px;
            }
            h2 {
              margin-bottom: 10px;
              color: #333;
            }
            .kode {
              font-family: 'Courier New', monospace;
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
            }
            .info {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            img {
              max-width: 300px;
              height: auto;
            }
            @media print {
              body {
                display: block;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h2>${selectedBarang?.nama_barang || 'Aset'}</h2>
            <div class="kode">${kode_unit}</div>
            <div class="info">${selectedBarang?.kategori || ''} - ${selectedBarang?.merk || ''}</div>
            <img src="${base64Image}" alt="QR Code ${kode_unit}" />
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-accent-800 dark:text-accent-100">Aset Masuk</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus size={20} />
          Tambah Aset Masuk
        </Button>
      </div>

      <div className="bg-white dark:bg-accent-800 rounded-lg shadow">
        <div className="p-4 border-b border-accent-200 dark:border-accent-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
            <input
              type="text"
              placeholder="Cari barang, kode, atau kategori..."
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
            title="Belum ada data aset masuk"
            description="Klik tombol Tambah Aset Masuk untuk mencatat penerimaan aset"
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
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Kategori</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Jumlah</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-accent-500 dark:text-accent-400 uppercase tracking-wider">Harga</th>
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
                        {item.kode_barang}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-accent-900 dark:text-accent-100">
                        <div className="font-medium">{item.nama_barang}</div>
                        <div className="text-accent-500 dark:text-accent-400 text-xs">{item.merk}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-500 dark:text-accent-400">
                        {item.kategori}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-900 dark:text-accent-100">
                        {item.jumlah_unit} {item.satuan}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-accent-900 dark:text-accent-100">
                        {formatCurrency(item.harga_satuan)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUnits(item)}
                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                            title="Lihat QR Code Unit"
                          >
                            <QrCode size={18} />
                          </button>
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
        title={editMode ? "Edit Aset Masuk" : "Tambah Aset Masuk"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Kode Barang"
              name="kode_barang"
              value={formData.kode_barang}
              onChange={handleChange}
              placeholder="Contoh: BRG-2026-0001"
              required
            />
            
            <FormInput
              label="Nama Barang"
              name="nama_barang"
              value={formData.nama_barang}
              onChange={handleChange}
              placeholder="Contoh: Laptop Dell"
              required
            />
            
            <FormInput
              label="Kategori"
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              placeholder="Contoh: Elektronik"
              required
            />
            
            <FormInput
              label="Merk"
              name="merk"
              value={formData.merk}
              onChange={handleChange}
              placeholder="Contoh: Dell"
            />
            
            <FormInput
              label="Tahun Masuk"
              name="tahun_masuk"
              type="number"
              value={formData.tahun_masuk}
              onChange={handleChange}
              min="2000"
              max="2100"
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

      {/* Modal QR Code */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="QR Code Unit Aset"
        size="xl"
      >
        {selectedBarang && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800">{selectedBarang.nama_barang}</h3>
              <p className="text-sm text-gray-600">{selectedBarang.kategori} - {selectedBarang.merk}</p>
              <p className="text-xs text-gray-500 mt-1">Total Unit: {selectedUnits.length}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {selectedUnits.map((unit) => (
                <div key={unit.kode_unit} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* QR Image - Loaded with authentication */}
                  <div className="text-center mb-3">
                    <div className="bg-white dark:bg-accent-900 p-3 rounded-lg inline-block">
                      {qrImages[unit.kode_unit] ? (
                        <img
                          src={qrImages[unit.kode_unit]}
                          alt={`QR ${unit.kode_unit}`}
                          className="w-48 h-48 mx-auto"
                          onError={(e) => {
                            console.error('Image load error for:', unit.kode_unit);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : qrImages[unit.kode_unit] === null ? (
                        <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded">
                          <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-red-600 text-xs font-medium">QR Code Error</span>
                          <span className="text-red-500 text-xs mt-1">{unit.kode_unit}</span>
                        </div>
                      ) : (
                        <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center bg-blue-50 border border-blue-200 rounded">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
                          <span className="text-blue-600 text-sm font-medium">Loading QR...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Kode Unit</p>
                      <p className="font-mono text-sm font-bold text-gray-900">{unit.kode_unit}</p>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-gray-500">Status: </span>
                        <span className={`font-medium ${
                          unit.status === 'AKTIF' ? 'text-green-600' : 
                          unit.status === 'KELUAR' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {unit.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Kondisi: </span>
                        <span className="font-medium text-gray-700">{unit.kondisi}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        onClick={() => handleDownloadQR(unit.kode_unit)}
                        variant="outline"
                        className="flex-1 text-xs py-1.5"
                      >
                        📥 Download
                      </Button>
                      <Button
                        onClick={() => handlePrintQR(unit.kode_unit)}
                        variant="outline"
                        className="flex-1 text-xs py-1.5"
                      >
                        🖨️ Print
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button onClick={() => setIsQRModalOpen(false)} variant="secondary">
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AsetMasuk;
