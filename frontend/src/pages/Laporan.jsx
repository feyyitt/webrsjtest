import { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axiosInstance from '../services/axios';

const REPORT_BRAND = 'RSJ Inventaris';
const REPORT_ORG = 'Sistem Inventaris Barang RSJ';
const REPORT_UNIT = 'RSJ Ratumbuysang';
const DATE_FORMAT = 'id-ID';
const REPORT_COLORS = {
  primary: [220, 38, 38],
  primaryDark: [185, 28, 28],
  primaryLight: [254, 242, 242],
  accentDark: [24, 24, 27],
  accentText: [39, 39, 42],
  mutedText: [82, 82, 91],
  border: [228, 228, 231],
  tableStripe: [250, 250, 250],
  white: [255, 255, 255],
};

const pdfTheme = {
  theme: 'grid',
  styles: {
    font: 'helvetica',
    fontSize: 7.8,
    cellPadding: 2.4,
    lineColor: REPORT_COLORS.border,
    lineWidth: 0.15,
    valign: 'middle',
    textColor: REPORT_COLORS.accentText,
  },
  headStyles: {
    fillColor: REPORT_COLORS.primary,
    textColor: 255,
    fontStyle: 'bold',
    halign: 'center',
  },
  bodyStyles: {
    minCellHeight: 7,
  },
  alternateRowStyles: {
    fillColor: REPORT_COLORS.tableStripe,
  },
  margin: { top: 28, right: 10, bottom: 16, left: 10 },
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(DATE_FORMAT);
};

const formatNumber = (value) => {
  const number = Number(value || 0);
  return number.toLocaleString(DATE_FORMAT);
};

const todayForFile = () => new Date().toISOString().split('T')[0];

const buildPeriodParams = (dateRange) => {
  const params = {};
  if (dateRange.start) params.from = dateRange.start;
  if (dateRange.end) params.to = dateRange.end;
  return params;
};

const getPeriodLabel = (dateRange) => {
  if (dateRange.start && dateRange.end) {
    return `${formatDate(dateRange.start)} s/d ${formatDate(dateRange.end)}`;
  }
  if (dateRange.start) return `Mulai ${formatDate(dateRange.start)}`;
  if (dateRange.end) return `Sampai ${formatDate(dateRange.end)}`;
  return 'Semua periode';
};

const addPdfHeader = (doc, title, subtitle) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...REPORT_COLORS.accentDark);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setFillColor(...REPORT_COLORS.primary);
  doc.rect(0, 22, pageWidth, 3, 'F');
  doc.setFillColor(...REPORT_COLORS.primary);
  doc.roundedRect(10, 6, 14, 14, 2, 2, 'F');
  doc.setTextColor(...REPORT_COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('RSJ', 17, 14.5, { align: 'center' });
  doc.setFontSize(14);
  doc.text(title, 29, 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(subtitle, 29, 16);
  doc.setFont('helvetica', 'bold');
  doc.text(REPORT_UNIT, pageWidth - 10, 9.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(REPORT_BRAND, pageWidth - 10, 16, { align: 'right' });
  doc.setTextColor(...REPORT_COLORS.accentText);
};

const addPdfMeta = (doc, rows, startY = 28) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const panelHeight = rows.length * 5 + 9;
  doc.setFillColor(...REPORT_COLORS.primaryLight);
  doc.roundedRect(10, startY, pageWidth - 20, panelHeight, 2, 2, 'F');
  doc.setDrawColor(...REPORT_COLORS.border);
  doc.roundedRect(10, startY, pageWidth - 20, panelHeight, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...REPORT_COLORS.primaryDark);
  doc.text('Informasi Laporan', 14, startY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  rows.forEach(([label, value], index) => {
    const y = startY + 13 + index * 5;
    doc.setTextColor(...REPORT_COLORS.mutedText);
    doc.text(label, 14, y);
    doc.setTextColor(...REPORT_COLORS.accentText);
    doc.text(`: ${value}`, 44, y);
  });
  return startY + panelHeight + 6;
};

const addPdfSummaryCards = (doc, cards, startY) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const gap = 4;
  const cardWidth = (pageWidth - 20 - gap * (cards.length - 1)) / cards.length;
  const cardHeight = 18;

  cards.forEach(([label, value], index) => {
    const x = 10 + index * (cardWidth + gap);
    doc.setFillColor(...REPORT_COLORS.white);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(...REPORT_COLORS.border);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'S');
    doc.setFillColor(...REPORT_COLORS.primary);
    doc.rect(x, startY, cardWidth, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...REPORT_COLORS.mutedText);
    doc.text(label, x + 3, startY + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...REPORT_COLORS.accentDark);
    doc.text(String(value), x + 3, startY + 15);
  });

  return startY + cardHeight + 8;
};

const addPdfPageNumbers = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...REPORT_COLORS.border);
    doc.line(10, pageHeight - 11, pageWidth - 10, pageHeight - 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...REPORT_COLORS.mutedText);
    doc.text(`${REPORT_UNIT} - Dicetak ${formatDate(new Date())}`, 10, pageHeight - 6);
    doc.text(`Halaman ${page} dari ${pageCount}`, pageWidth - 10, pageHeight - 6, { align: 'right' });
  }
};

const addSectionTitle = (doc, title, y) => {
  doc.setFillColor(...REPORT_COLORS.primary);
  doc.rect(10, y - 4, 1.5, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...REPORT_COLORS.accentDark);
  doc.text(title, 14, y);
};

const createWorkbook = () => {
  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: REPORT_ORG,
    Subject: 'Laporan Inventaris',
    Author: `${REPORT_BRAND} - ${REPORT_UNIT}`,
    CreatedDate: new Date(),
  };
  return wb;
};

const applyExcelStyle = (cell, style) => {
  if (!cell) return;
  cell.s = {
    ...(cell.s || {}),
    ...style,
  };
};

const addSheet = (wb, name, title, metadataRows, headers, rows, columnWidths) => {
  const data = [
    [title],
    [REPORT_UNIT],
    [REPORT_ORG],
    ...metadataRows.map(([label, value]) => [`${label}:`, value]),
    [],
    headers,
    ...rows,
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const headerRowIndex = metadataRows.length + 4;
  const range = XLSX.utils.decode_range(ws['!ref']);

  ws['!cols'] = columnWidths.map((wch) => ({ wch }));
  ws['!rows'] = data.map((_, index) => ({
    hpt: index === 0 ? 24 : index === headerRowIndex ? 22 : 18,
  }));
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(headers.length - 1, 1) } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: Math.max(headers.length - 1, 1) } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: Math.max(headers.length - 1, 1) } },
  ];
  ws['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: headerRowIndex, c: 0 },
      e: { r: Math.max(range.e.r, headerRowIndex), c: headers.length - 1 },
    }),
  };
  ws['!freeze'] = { xSplit: 0, ySplit: headerRowIndex + 1 };

  applyExcelStyle(ws.A1, {
    font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: 'DC2626' } },
    alignment: { vertical: 'center' },
  });
  applyExcelStyle(ws.A2, {
    font: { bold: true, color: { rgb: '18181B' } },
    alignment: { vertical: 'center' },
  });
  applyExcelStyle(ws.A3, {
    font: { color: { rgb: '52525B' } },
    alignment: { vertical: 'center' },
  });

  for (let row = 3; row < headerRowIndex - 1; row += 1) {
    applyExcelStyle(ws[XLSX.utils.encode_cell({ r: row, c: 0 })], {
      font: { bold: true, color: { rgb: '52525B' } },
    });
  }

  for (let col = 0; col < headers.length; col += 1) {
    applyExcelStyle(ws[XLSX.utils.encode_cell({ r: headerRowIndex, c: col })], {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'DC2626' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E4E4E7' } },
        bottom: { style: 'thin', color: { rgb: 'E4E4E7' } },
      },
    });
  }

  XLSX.utils.book_append_sheet(wb, ws, name);
};

const addSummarySheet = (wb, title, metadataRows, summaryRows) => {
  addSheet(
    wb,
    'Ringkasan',
    title,
    metadataRows,
    ['Keterangan', 'Nilai'],
    summaryRows,
    [38, 22]
  );
};

const flattenTransactionRows = (transactions, tipeBarang, tipeTransaksi) => {
  const rows = [];

  transactions
    .filter((transaction) => transaction.tipe_barang === tipeBarang)
    .forEach((transaction) => {
      const details = transaction.detail_barang?.length
        ? transaction.detail_barang
        : [{ kode_barang: '-', nama_barang: '-', kategori: '-', jumlah: transaction.total_item || 0, satuan: '-' }];

      details.forEach((detail) => {
        rows.push({
          tanggal: transaction.tanggal,
          tipe: tipeTransaksi,
          kode_barang: detail.kode_barang || '-',
          nama_barang: detail.nama_barang || '-',
          kategori: detail.kategori || '-',
          jumlah: detail.jumlah || 0,
          satuan: detail.satuan || '-',
          user: transaction.user || '-',
          keterangan: transaction.keterangan || '-',
        });
      });
    });

  return rows;
};

const toTransactionTableRows = (rows) => rows.map((row, index) => [
  index + 1,
  formatDate(row.tanggal),
  row.tipe,
  row.kode_barang,
  row.nama_barang,
  row.kategori,
  formatNumber(row.jumlah),
  row.satuan,
  row.user,
  row.keterangan,
]);

const fetchTransactionReports = async (dateRange) => {
  const params = buildPeriodParams(dateRange);
  const [masukRes, keluarRes] = await Promise.all([
    axiosInstance.get('/laporan/masuk', { params }),
    axiosInstance.get('/laporan/keluar', { params }),
  ]);

  return {
    masuk: masukRes.data?.data?.data || [],
    keluar: keluarRes.data?.data?.data || [],
  };
};

const Laporan = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const getMetadataRows = (title, includePeriod = true) => [
    ['Jenis Laporan', title],
    ['Periode', includePeriod ? getPeriodLabel(dateRange) : 'Stok berjalan'],
    ['Tanggal Cetak', formatDate(new Date())],
  ];

  const downloadStokPDF = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/laporan/stok');
      const asetItems = response.data?.data?.aset || [];
      const habisPakaiItems = response.data?.data?.habis_pakai || [];
      const ringkasan = response.data?.data?.ringkasan || {};
      const items = [...asetItems, ...habisPakaiItems];

      const doc = new jsPDF({ orientation: 'landscape' });
      addPdfHeader(doc, 'Laporan Stok Barang', 'Stok aset aktif dan barang habis pakai');
      let cursorY = addPdfMeta(doc, [
        ['Periode', 'Stok berjalan'],
        ['Tanggal Cetak', formatDate(new Date())],
      ]);
      cursorY = addPdfSummaryCards(doc, [
        ['Jenis Aset', formatNumber(ringkasan.total_jenis_aset)],
        ['Unit Aset Aktif', formatNumber(ringkasan.total_unit_aset)],
        ['Jenis Habis Pakai', formatNumber(ringkasan.total_jenis_habis_pakai)],
        ['Stok Habis Pakai', formatNumber(ringkasan.total_stok_habis_pakai)],
      ], cursorY);
      addSectionTitle(doc, 'Daftar Stok Barang', cursorY);

      autoTable(doc, {
        ...pdfTheme,
        startY: cursorY + 4,
        head: [['No', 'Kode Barang', 'Nama Barang', 'Kategori', 'Merk', 'Jenis', 'Stok', 'Satuan']],
        body: items.map((item, index) => [
          index + 1,
          item.kode_barang || '-',
          item.nama_barang || '-',
          item.kategori || '-',
          item.merk || '-',
          item.jenis_barang || '-',
          formatNumber(item.jumlah),
          item.satuan || '-',
        ]),
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          1: { cellWidth: 28 },
          4: { cellWidth: 28 },
          5: { halign: 'center', cellWidth: 30 },
          6: { halign: 'right', cellWidth: 18 },
          7: { halign: 'center', cellWidth: 20 },
        },
      });

      addPdfPageNumbers(doc);
      doc.save(`Laporan_Stok_${todayForFile()}.pdf`);
      toast.success('Laporan stok berhasil didownload');
    } catch {
      toast.error('Gagal mendownload laporan stok');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadStokExcel = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/laporan/stok');
      const asetItems = response.data?.data?.aset || [];
      const habisPakaiItems = response.data?.data?.habis_pakai || [];
      const ringkasan = response.data?.data?.ringkasan || {};
      const wb = createWorkbook();
      const metadataRows = getMetadataRows('Laporan Stok Barang', false);
      const headers = ['No', 'Kode Barang', 'Nama Barang', 'Kategori', 'Merk', 'Jenis Barang', 'Stok', 'Satuan'];
      const toRows = (items) => items.map((item, index) => [
        index + 1,
        item.kode_barang || '-',
        item.nama_barang || '-',
        item.kategori || '-',
        item.merk || '-',
        item.jenis_barang || '-',
        item.jumlah || 0,
        item.satuan || '-',
      ]);

      addSummarySheet(wb, 'Ringkasan Laporan Stok Barang', metadataRows, [
        ['Total Jenis Aset', ringkasan.total_jenis_aset || 0],
        ['Total Unit Aset', ringkasan.total_unit_aset || 0],
        ['Total Jenis Habis Pakai', ringkasan.total_jenis_habis_pakai || 0],
        ['Total Stok Habis Pakai', ringkasan.total_stok_habis_pakai || 0],
      ]);
      addSheet(wb, 'Stok Gabungan', 'Laporan Stok Barang', metadataRows, headers, toRows([...asetItems, ...habisPakaiItems]), [6, 18, 34, 24, 22, 18, 12, 14]);
      addSheet(wb, 'Stok Aset', 'Laporan Stok Aset', metadataRows, headers, toRows(asetItems), [6, 18, 34, 24, 22, 16, 12, 14]);
      addSheet(wb, 'Stok Habis Pakai', 'Laporan Stok Habis Pakai', metadataRows, headers, toRows(habisPakaiItems), [6, 18, 34, 24, 22, 18, 12, 14]);

      XLSX.writeFile(wb, `Laporan_Stok_${todayForFile()}.xlsx`, { cellStyles: true });
      toast.success('Laporan stok berhasil didownload');
    } catch {
      toast.error('Gagal mendownload laporan stok');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTransactionPDF = async ({ tipeBarang, title, filePrefix }) => {
    const { masuk, keluar } = await fetchTransactionReports(dateRange);
    const masukRows = flattenTransactionRows(masuk, tipeBarang, 'MASUK');
    const keluarRows = flattenTransactionRows(keluar, tipeBarang, 'KELUAR');
    const totalMasuk = masukRows.reduce((sum, row) => sum + Number(row.jumlah || 0), 0);
    const totalKeluar = keluarRows.reduce((sum, row) => sum + Number(row.jumlah || 0), 0);
    const doc = new jsPDF({ orientation: 'landscape' });

    addPdfHeader(doc, title, 'Riwayat transaksi masuk dan keluar');
    let cursorY = addPdfMeta(doc, [
      ['Periode', getPeriodLabel(dateRange)],
      ['Tanggal Cetak', formatDate(new Date())],
    ]);
    cursorY = addPdfSummaryCards(doc, [
      ['Baris Masuk', formatNumber(masukRows.length)],
      ['Total Item Masuk', formatNumber(totalMasuk)],
      ['Baris Keluar', formatNumber(keluarRows.length)],
      ['Total Item Keluar', formatNumber(totalKeluar)],
    ], cursorY);

    const head = [['No', 'Tanggal', 'Tipe', 'Kode', 'Nama Barang', 'Kategori', 'Jumlah', 'Satuan', 'Petugas', 'Keterangan']];

    addSectionTitle(doc, 'Transaksi Masuk', cursorY);
    autoTable(doc, {
      ...pdfTheme,
      startY: cursorY + 4,
      head,
      body: toTransactionTableRows(masukRows),
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'center', cellWidth: 18 },
        3: { cellWidth: 26 },
        6: { halign: 'right', cellWidth: 18 },
        7: { halign: 'center', cellWidth: 16 },
        8: { cellWidth: 28 },
      },
    });

    cursorY = (doc.lastAutoTable?.finalY || cursorY) + 10;
    if (cursorY > 180) {
      doc.addPage();
      cursorY = 26;
    }

    addSectionTitle(doc, 'Transaksi Keluar', cursorY);
    autoTable(doc, {
      ...pdfTheme,
      startY: cursorY + 4,
      head,
      body: toTransactionTableRows(keluarRows),
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'center', cellWidth: 18 },
        3: { cellWidth: 26 },
        6: { halign: 'right', cellWidth: 18 },
        7: { halign: 'center', cellWidth: 16 },
        8: { cellWidth: 28 },
      },
    });

    addPdfPageNumbers(doc);
    doc.save(`${filePrefix}_${todayForFile()}.pdf`);
  };

  const downloadTransactionExcel = async ({ tipeBarang, title, filePrefix }) => {
    const { masuk, keluar } = await fetchTransactionReports(dateRange);
    const masukRows = flattenTransactionRows(masuk, tipeBarang, 'MASUK');
    const keluarRows = flattenTransactionRows(keluar, tipeBarang, 'KELUAR');
    const totalMasuk = masukRows.reduce((sum, row) => sum + Number(row.jumlah || 0), 0);
    const totalKeluar = keluarRows.reduce((sum, row) => sum + Number(row.jumlah || 0), 0);
    const wb = createWorkbook();
    const metadataRows = getMetadataRows(title, true);
    const headers = ['No', 'Tanggal', 'Tipe', 'Kode Barang', 'Nama Barang', 'Kategori', 'Jumlah', 'Satuan', 'Petugas', 'Keterangan'];
    const widths = [6, 14, 12, 18, 34, 24, 12, 12, 24, 42];

    addSummarySheet(wb, `Ringkasan ${title}`, metadataRows, [
      ['Jumlah Baris Masuk', masukRows.length],
      ['Total Item Masuk', totalMasuk],
      ['Jumlah Baris Keluar', keluarRows.length],
      ['Total Item Keluar', totalKeluar],
    ]);
    addSheet(wb, 'Transaksi Masuk', `${title} - Transaksi Masuk`, metadataRows, headers, toTransactionTableRows(masukRows), widths);
    addSheet(wb, 'Transaksi Keluar', `${title} - Transaksi Keluar`, metadataRows, headers, toTransactionTableRows(keluarRows), widths);

    XLSX.writeFile(wb, `${filePrefix}_${todayForFile()}.xlsx`, { cellStyles: true });
  };

  const downloadAsetPDF = async () => {
    try {
      setIsLoading(true);
      await downloadTransactionPDF({
        tipeBarang: 'ASET',
        title: 'Laporan Transaksi Aset',
        filePrefix: 'Laporan_Aset',
      });
      toast.success('Laporan aset berhasil didownload');
    } catch {
      toast.error('Gagal mendownload laporan aset');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsetExcel = async () => {
    try {
      setIsLoading(true);
      await downloadTransactionExcel({
        tipeBarang: 'ASET',
        title: 'Laporan Transaksi Aset',
        filePrefix: 'Laporan_Aset',
      });
      toast.success('Laporan aset berhasil didownload');
    } catch {
      toast.error('Gagal mendownload laporan aset');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadHabisPakaiPDF = async () => {
    try {
      setIsLoading(true);
      await downloadTransactionPDF({
        tipeBarang: 'HABIS_PAKAI',
        title: 'Laporan Barang Habis Pakai',
        filePrefix: 'Laporan_HabisPakai',
      });
      toast.success('Laporan habis pakai berhasil didownload');
    } catch {
      toast.error('Gagal mendownload laporan habis pakai');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadHabisPakaiExcel = async () => {
    try {
      setIsLoading(true);
      await downloadTransactionExcel({
        tipeBarang: 'HABIS_PAKAI',
        title: 'Laporan Barang Habis Pakai',
        filePrefix: 'Laporan_HabisPakai',
      });
      toast.success('Laporan habis pakai berhasil didownload');
    } catch {
      toast.error('Gagal mendownload laporan habis pakai');
    } finally {
      setIsLoading(false);
    }
  };

  const reportCards = [
    {
      title: 'Laporan Stok',
      description: 'Laporan stok barang',
      iconClass: 'bg-blue-100',
      iconColor: 'text-blue-600',
      onPdf: downloadStokPDF,
      onExcel: downloadStokExcel,
    },
    {
      title: 'Laporan Aset',
      description: 'Laporan transaksi aset',
      iconClass: 'bg-green-100',
      iconColor: 'text-green-600',
      onPdf: downloadAsetPDF,
      onExcel: downloadAsetExcel,
    },
    {
      title: 'Laporan Habis Pakai',
      description: 'Laporan barang habis pakai',
      iconClass: 'bg-purple-100',
      iconColor: 'text-purple-600',
      onPdf: downloadHabisPakaiPDF,
      onExcel: downloadHabisPakaiExcel,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Laporan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reportCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`${card.iconClass} p-2 sm:p-3 rounded-lg`}>
                <FileText size={24} className={card.iconColor} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={card.onPdf}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={18} />
                PDF
              </button>
              <button
                onClick={card.onExcel}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={18} />
                Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Filter Periode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <div className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
              <Calendar size={18} />
              {getPeriodLabel(dateRange)}
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Filter periode digunakan untuk laporan transaksi aset dan barang habis pakai.
        </p>
      </div>
    </div>
  );
};

export default Laporan;
