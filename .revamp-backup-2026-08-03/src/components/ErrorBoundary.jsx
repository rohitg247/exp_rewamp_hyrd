// src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }


  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }


  componentDidCatch(error, errorInfo) {
    // Log error details to console for debugging
    console.error('🔥 ERROR BOUNDARY CAUGHT:', error);
    console.error('Component Stack:', errorInfo.componentStack);


    // Store error details in state
    this.setState({
      error,
      errorInfo
    });
  }


  handleReset = () => {
    // Reset error state and reload app
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };


  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-theme-bg flex items-center justify-center p-8">
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>


            <h1 className="text-3xl font-bold text-center text-heading mb-4">
              Application Error
            </h1>


            <p className="text-center text-[var(--color-text-muted)] mb-6">
              The application encountered an unexpected error and needs to restart.
            </p>


            {/* Error Details (for debugging) */}
            <div className="bg-[var(--color-gray-50)] rounded-lg p-4 mb-6 max-h-64 overflow-auto">
              <p className="text-sm font-mono text-red-600 mb-2">
                {this.state.error?.toString()}
              </p>
              <pre className="text-xs text-[var(--color-text)] whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>


            <button
              onClick={this.handleReset}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={20} />
              Restart Application
            </button>


            <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
              If this problem persists, please contact technical support.
            </p>
          </div>
        </div>
      );
    }


    return this.props.children;
  }
}


export default ErrorBoundary;
