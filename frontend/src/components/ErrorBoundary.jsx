import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-accent-950 dark:to-accent-900 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-accent-800 rounded-xl shadow-xl border border-red-200 dark:border-red-800 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                  Oops! Terjadi Kesalahan
                </h1>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  Aplikasi mengalami error yang tidak terduga. Silakan refresh halaman atau hubungi administrator.
                </p>
                
                {this.state.error && (
                  <details className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200 mb-2">
                      Detail Error (untuk debugging)
                    </summary>
                    <div className="mt-2 text-sm font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap break-all">
                      <p className="font-bold mb-2">Error:</p>
                      <p className="mb-4">{this.state.error.toString()}</p>
                      {this.state.errorInfo && (
                        <>
                          <p className="font-bold mb-2">Component Stack:</p>
                          <p>{this.state.errorInfo.componentStack}</p>
                        </>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all"
                  >
                    Refresh Halaman
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-4 py-2 bg-gray-200 dark:bg-accent-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-accent-600 transition-all"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
