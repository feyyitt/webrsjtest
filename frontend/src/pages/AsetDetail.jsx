import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Package, ChevronDown, ChevronUp, ChevronRight, LogIn, Wrench, ArrowUpFromLine, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/useDarkMode';
import axiosInstance from '../services/axios';

const KondisiBadge = ({ kondisi }) => {
  const config = {
    BAIK:   { label: 'Baik',   className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
    RUSAK:  { label: 'Rusak',  className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
    HILANG: { label: 'Hilang', className: 'bg-accent-200 text-accent-600 dark:bg-accent-700 dark:text-accent-300' },
  };
  const c = config[kondisi] || config.BAIK;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${c.className}`}>
      {c.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const isAktif = status === 'AKTIF';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
      isAktif
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
        : 'bg-accent-200 text-accent-500 dark:bg-accent-700 dark:text-accent-400'
    }`}>
      {isAktif ? 'Aktif' : 'Tidak Aktif'}
    </span>
  );
};

const formatDate = (d) =>
  d ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d)) : '-';

export default function AsetDetail() {
  const { kode_unit } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { darkMode } = useDarkMode();

  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [riwayat, setRiwayat]           = useState([]);
  const [showRiwayat, setShowRiwayat]   = useState(false);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  const [showKondisiModal, setShowKondisiModal] = useState(false);
  const [kondisiForm, setKondisiForm]           = useState({ kondisi: '', keterangan: '' });
  const [savingKondisi, setSavingKondisi]       = useState(false);

  const [showKeluarModal, setShowKeluarModal] = useState(false);
  const [keluarForm, setKeluarForm]           = useState({ tujuan: '', keterangan: '' });
  const [savingKeluar, setSavingKeluar]       = useState(false);

  useEffect(() => {
    fetchDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kode_unit]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const res = await axiosInstance.get(`/aset/unit/${kode_unit}`);
      setDetail(res.data.data);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
      else toast.error('Gagal memuat data unit');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRiwayat = async () => {
    if (showRiwayat) { setShowRiwayat(false); return; }
    try {
      setLoadingRiwayat(true);
      const res = await axiosInstance.get(`/aset/unit/${kode_unit}/riwayat`);
      setRiwayat(res.data.data);
      setShowRiwayat(true);
    } catch { toast.error('Gagal memuat riwayat'); }
    finally { setLoadingRiwayat(false); }
  };

  const handleUpdateKondisi = async (e) => {
    e.preventDefault();
    if (!kondisiForm.kondisi) { toast.error('Pilih kondisi terlebih dahulu'); return; }
    try {
      setSavingKondisi(true);
      await axiosInstance.put(`/aset/unit/${kode_unit}/kondisi`, kondisiForm);
      toast.success('Kondisi berhasil diperbarui');
      setShowKondisiModal(false);
      fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui kondisi');
    } finally { setSavingKondisi(false); }
  };

  const handleCatatKeluar = async (e) => {
    e.preventDefault();
    try {
      setSavingKeluar(true);
      await axiosInstance.post(`/aset/unit/${kode_unit}/keluar`, keluarForm);
      toast.success('Aset berhasil dicatat keluar');
      setShowKeluarModal(false);
      fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat aset keluar');
    } finally { setSavingKeluar(false); }
  };

  // Apply dark class sama seperti main app
  const rootClass = darkMode ? 'dark' : '';

  if (loading) {
    return (
      <div className={rootClass}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-50 to-white dark:from-accent-900 dark:to-accent-800 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
            <p className="text-accent-500 dark:text-accent-400 text-sm font-medium">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={rootClass}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent-50 to-white dark:from-accent-900 dark:to-accent-800 p-6 transition-colors">
          <div className="w-20 h-20 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center mb-4">
            <Package size={36} className="text-accent-400 dark:text-accent-500" />
          </div>
          <h1 className="text-xl font-bold text-accent-900 dark:text-white mb-1">Unit Tidak Ditemukan</h1>
          <p className="text-accent-500 dark:text-accent-400 text-sm text-center mb-6">
            Kode unit <span className="font-mono font-semibold text-accent-700 dark:text-accent-300">{kode_unit}</span> tidak ada di sistem.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <LogIn size={16} /> Masuk ke Sistem
          </Link>
        </div>
      </div>
    );
  }

  const { unit_aset, barang, penerimaan, jumlah_unit_aktif } = detail;
  const isAktif = unit_aset.status === 'AKTIF';

  return (
    <div className={rootClass}>
      <div className="min-h-screen bg-gradient-to-br from-accent-50 to-white dark:from-accent-900 dark:to-accent-800 transition-colors">

        {/* Header â€” gradient merah sama seperti Sidebar */}
        <div className="bg-gradient-to-b from-primary-700 to-primary-900 text-white">
          <div className="max-w-lg mx-auto px-4 pt-8 pb-6">
            {/* Branding */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <Package size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/90 leading-none">Inventaris Barang</p>
                <p className="text-[10px] text-primary-200 leading-none mt-0.5">RSJ Ratumbuysang</p>
              </div>
            </div>
            {/* Unit info */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-primary-200 text-[11px] font-semibold uppercase tracking-widest mb-0.5">Detail Aset</p>
                <h1 className="text-2xl font-bold font-mono tracking-tight break-all">{unit_aset.kode_unit}</h1>
                <p className="text-primary-100 text-sm mt-1 font-medium">{barang.nama_barang}</p>
              </div>
              <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                <KondisiBadge kondisi={unit_aset.kondisi} />
                <StatusBadge status={unit_aset.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 -mt-2 pb-10 space-y-3">

          {/* Info Card */}
          <div className="bg-white dark:bg-accent-800 rounded-2xl shadow-sm border border-accent-100 dark:border-accent-700 p-5 transition-colors">
            <p className="text-[11px] font-semibold text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-3">Informasi Barang</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <div>
                <p className="text-[11px] font-medium text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-0.5">Kode Barang</p>
                <p className="font-mono font-semibold text-accent-800 dark:text-accent-100 text-sm">{barang.kode_barang}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-0.5">Tahun Masuk</p>
                <p className="font-semibold text-accent-800 dark:text-accent-100 text-sm">{penerimaan.tahun_masuk}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-0.5">Kategori</p>
                <p className="font-medium text-accent-700 dark:text-accent-200 text-sm">{barang.kategori || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-0.5">Unit Aktif</p>
                <p className="font-semibold text-accent-800 dark:text-accent-100 text-sm">{jumlah_unit_aktif} unit</p>
              </div>
            </div>
            {unit_aset.keterangan && (
              <div className="mt-4 pt-3.5 border-t border-accent-100 dark:border-accent-700">
                <p className="text-[11px] font-medium text-accent-400 dark:text-accent-500 uppercase tracking-wider mb-0.5">Keterangan</p>
                <p className="text-accent-600 dark:text-accent-300 text-sm">{unit_aset.keterangan}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'PETUGAS') ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-accent-400 dark:text-accent-500 uppercase tracking-wider px-1 pt-1">Tindakan</p>

              {/* Lihat Riwayat */}
              <button
                onClick={handleToggleRiwayat}
                disabled={loadingRiwayat}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-accent-800 rounded-xl border border-accent-200 dark:border-accent-700 text-accent-800 dark:text-accent-100 hover:bg-accent-50 dark:hover:bg-accent-700 active:scale-[0.99] transition-all disabled:opacity-60 shadow-sm"
              >
                <span className="flex items-center gap-3 font-medium text-sm">
                  <span className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-700 flex items-center justify-center">
                    <ClipboardList size={15} className="text-accent-600 dark:text-accent-300" />
                  </span>
                  {loadingRiwayat ? 'Memuat...' : 'Lihat Riwayat'}
                </span>
                {showRiwayat ? <ChevronUp size={16} className="text-accent-400" /> : <ChevronDown size={16} className="text-accent-400" />}
              </button>

              {/* Riwayat inline */}
              {showRiwayat && (
                <div className="bg-white dark:bg-accent-800 rounded-xl border border-accent-200 dark:border-accent-700 px-4 py-3 shadow-sm transition-colors">
                  <p className="text-xs font-semibold text-accent-500 dark:text-accent-400 uppercase tracking-wider mb-3">Riwayat Mutasi</p>
                  {riwayat.length === 0 ? (
                    <p className="text-accent-400 dark:text-accent-500 text-sm text-center py-5">Belum ada riwayat untuk unit ini</p>
                  ) : (
                    <div className="space-y-2.5">
                      {riwayat.map((r) => (
                        <div key={r.id} className="flex items-start gap-3 pb-2.5 border-b border-accent-100 dark:border-accent-700 last:border-0 last:pb-0">
                          <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            r.tipe === 'MASUK'
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                              : 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
                          }`}>
                            {r.tipe === 'MASUK' ? 'â†“' : 'â†‘'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-accent-800 dark:text-accent-100">
                              {r.tipe === 'MASUK' ? 'Barang Masuk' : 'Barang Keluar'}
                            </p>
                            <p className="text-xs text-accent-400 dark:text-accent-500 mt-0.5">
                              {formatDate(r.tanggal)} Â· {r.petugas}
                            </p>
                            {r.keterangan && (
                              <p className="text-xs text-accent-500 dark:text-accent-400 mt-0.5 line-clamp-2">{r.keterangan}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isAktif && (
                <>
                  <button
                    onClick={() => { setKondisiForm({ kondisi: unit_aset.kondisi, keterangan: unit_aset.keterangan || '' }); setShowKondisiModal(true); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-accent-800 rounded-xl border border-accent-200 dark:border-accent-700 text-accent-800 dark:text-accent-100 hover:bg-accent-50 dark:hover:bg-accent-700 active:scale-[0.99] transition-all shadow-sm"
                  >
                    <span className="flex items-center gap-3 font-medium text-sm">
                      <span className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Wrench size={15} className="text-yellow-600 dark:text-yellow-400" />
                      </span>
                      Update Kondisi
                    </span>
                    <ChevronRight size={16} className="text-accent-400" />
                  </button>

                  <button
                    onClick={() => { setKeluarForm({ tujuan: '', keterangan: '' }); setShowKeluarModal(true); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 active:scale-[0.99] transition-all shadow-sm"
                  >
                    <span className="flex items-center gap-3 font-medium text-sm">
                      <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                        <ArrowUpFromLine size={15} className="text-primary-600 dark:text-primary-400" />
                      </span>
                      Catat Barang Keluar
                    </span>
                    <ChevronRight size={16} className="text-primary-400" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-accent-800 border border-accent-200 dark:border-accent-700 rounded-2xl p-5 text-center shadow-sm transition-colors">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <LogIn size={22} className="text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-sm text-accent-600 dark:text-accent-300 mb-4 leading-relaxed">
                Masuk ke sistem untuk mencatat atau mengubah data aset ini.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                <LogIn size={15} /> Login
              </Link>
            </div>
          )}
        </div>

        {/* Update Kondisi Modal */}
        {showKondisiModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white dark:bg-accent-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-2xl border border-accent-100 dark:border-accent-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <Wrench size={17} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-accent-900 dark:text-white">Update Kondisi</h3>
                  <p className="text-xs text-accent-400 dark:text-accent-500 font-mono mt-0.5">{kode_unit}</p>
                </div>
              </div>
              <form onSubmit={handleUpdateKondisi} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
                    Kondisi <span className="text-primary-500">*</span>
                  </label>
                  <select
                    value={kondisiForm.kondisi}
                    onChange={(e) => setKondisiForm((p) => ({ ...p, kondisi: e.target.value }))}
                    className="w-full border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-accent-900 dark:text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  >
                    <option value="">-- Pilih Kondisi --</option>
                    <option value="BAIK">Baik</option>
                    <option value="RUSAK">Rusak</option>
                    <option value="HILANG">Hilang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
                    Keterangan <span className="text-accent-400">(opsional)</span>
                  </label>
                  <textarea
                    value={kondisiForm.keterangan}
                    onChange={(e) => setKondisiForm((p) => ({ ...p, keterangan: e.target.value }))}
                    rows={3}
                    placeholder="Catatan tambahan mengenai kondisi..."
                    className="w-full border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-accent-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-colors placeholder:text-accent-400"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowKondisiModal(false)}
                    className="flex-1 py-3 border border-accent-300 dark:border-accent-600 rounded-xl text-accent-700 dark:text-accent-300 font-medium text-sm hover:bg-accent-50 dark:hover:bg-accent-700 transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={savingKondisi}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors">
                    {savingKondisi ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Catat Keluar Modal */}
        {showKeluarModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white dark:bg-accent-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-2xl border border-accent-100 dark:border-accent-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <ArrowUpFromLine size={17} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-accent-900 dark:text-white">Catat Barang Keluar</h3>
                  <p className="text-xs text-accent-400 dark:text-accent-500 mt-0.5">
                    <span className="font-mono">{kode_unit}</span> Â· {barang.nama_barang}
                  </p>
                </div>
              </div>
              <form onSubmit={handleCatatKeluar} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-accent-50 dark:bg-accent-900/50 rounded-xl px-3 py-2.5 border border-accent-100 dark:border-accent-700">
                    <p className="text-[10px] font-semibold text-accent-400 dark:text-accent-500 uppercase tracking-wider">Tanggal Keluar</p>
                    <p className="text-sm font-semibold text-accent-800 dark:text-accent-100 mt-0.5">
                      {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())}
                    </p>
                  </div>
                  <div className="bg-accent-50 dark:bg-accent-900/50 rounded-xl px-3 py-2.5 border border-accent-100 dark:border-accent-700">
                    <p className="text-[10px] font-semibold text-accent-400 dark:text-accent-500 uppercase tracking-wider">Nama Petugas</p>
                    <p className="text-sm font-semibold text-accent-800 dark:text-accent-100 mt-0.5 truncate">
                      {user?.nama || user?.username || '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">Tujuan / Ruangan</label>
                  <input
                    type="text"
                    value={keluarForm.tujuan}
                    onChange={(e) => setKeluarForm((p) => ({ ...p, tujuan: e.target.value }))}
                    placeholder="Contoh: Ruang ICU, Poli Jiwa..."
                    className="w-full border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-accent-900 dark:text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors placeholder:text-accent-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1.5">
                    Keterangan <span className="text-accent-400">(opsional)</span>
                  </label>
                  <textarea
                    value={keluarForm.keterangan}
                    onChange={(e) => setKeluarForm((p) => ({ ...p, keterangan: e.target.value }))}
                    rows={3}
                    placeholder="Catatan tambahan..."
                    className="w-full border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-accent-900 dark:text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-colors placeholder:text-accent-400"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowKeluarModal(false)}
                    className="flex-1 py-3 border border-accent-300 dark:border-accent-600 rounded-xl text-accent-700 dark:text-accent-300 font-medium text-sm hover:bg-accent-50 dark:hover:bg-accent-700 transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={savingKeluar}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors">
                    {savingKeluar ? 'Menyimpan...' : 'Catat Keluar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
