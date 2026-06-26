import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ScanLine, X, CheckCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Button from '../components/Button';

const AsetScan = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const scannerRef = useRef(null);
  const navigationRef = useRef(null);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => {
        console.error('Failed to clear scanner:', error);
      });
      scannerRef.current = null;
    }
  }, []);

  const onScanError = useCallback(() => {
    // Suppress frequent scan errors
  }, []);

  const onScanSuccess = useCallback(async (decodedText) => {
    // QR bisa berisi URL penuh (http://localhost:5173/aset/AST-001-001)
    // atau langsung kode_unit (AST-001-001) — ekstrak kode_unit dari keduanya
    let kode_unit = decodedText.trim();
    try {
      const url = new URL(decodedText);
      const parts = url.pathname.split('/').filter(Boolean);
      // pathname: /aset/AST-001-001 → parts: ['aset', 'AST-001-001']
      if (parts.length >= 2 && parts[0] === 'aset') {
        kode_unit = parts[1];
      }
    } catch {
      // bukan URL, gunakan langsung sebagai kode_unit
    }

    setScannedData(kode_unit);
    setScanning(false);
    // Note: fetchUnitByKode akan dipanggil di dependency
  }, []);

  const startScanner = useCallback(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      false
    );

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    if (scanning) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [scanning, startScanner, stopScanner]);

  // Navigate ke halaman detail ketika QR berhasil di-scan
  useEffect(() => {
    if (scannedData && !navigationRef.current) {
      navigationRef.current = true;
      const timer = setTimeout(() => {
        setShowSuccess(true);
        setIsLoading(true);
        navigate(`/aset/${scannedData}`);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scannedData, navigate]);

  const handleReset = () => {
    setScannedData(null);
    setIsLoading(false);
    setShowSuccess(false);
    navigationRef.current = false;
    setScanning(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-accent-800 dark:text-accent-100">Scan QR Code - Aset</h1>
          <p className="text-sm text-accent-500 dark:text-accent-400 mt-1">Arahkan kamera ke QR code barang</p>
        </div>
        {scannedData && (
          <Button onClick={() => handleReset()} variant="primary">
            <Camera size={20} />
            Scan Lagi
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-accent-800 rounded-lg shadow p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          {!scanning && !scannedData ? (
            <div className="text-center">
              <div className="bg-accent-100 dark:bg-accent-700 rounded-lg p-8 sm:p-12 mb-6">
                <ScanLine size={64} className="mx-auto text-accent-400 mb-4" />
                <p className="text-accent-600 dark:text-accent-300 mb-2">Klik tombol di bawah untuk mulai scan</p>
                <p className="text-sm text-accent-500 dark:text-accent-400">Pastikan QR code berada dalam frame kamera</p>
              </div>

              <Button
                onClick={() => setScanning(true)}
                variant="primary"
                className="w-full sm:w-auto"
              >
                <Camera size={20} />
                Mulai Scan
              </Button>
            </div>
          ) : scanning ? (
            <div>
              <div id="qr-reader" className="w-full"></div>
              <div className="mt-4 text-center">
                <Button
                  onClick={() => setScanning(false)}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  <X size={20} />
                  Stop Scan
                </Button>
              </div>
            </div>
          ) : scannedData && isLoading && showSuccess ? (
            <div className="text-center py-12">
              <div className="bg-primary-50 dark:bg-primary-900 border-2 border-primary-200 dark:border-primary-700 rounded-lg p-8 mb-6">
                <CheckCircle size={64} className="mx-auto text-primary-600 dark:text-primary-400 mb-4" />
                <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-100 mb-2">QR Code Terdeteksi!</h3>
                <div className="bg-white dark:bg-accent-900 rounded px-4 py-2 inline-block mb-6">
                  <code className="text-sm font-mono text-accent-700 dark:text-accent-300">{scannedData}</code>
                </div>
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-300 border-t-primary-600"></div>
                </div>
                <p className="text-accent-600 dark:text-accent-300">Membuka halaman detail...</p>
              </div>
            </div>
          ) : null}
      </div>

      </div>
    </div>
  );
};

export default AsetScan;
