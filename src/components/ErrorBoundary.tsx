import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#07080D] text-slate-200 flex flex-col items-center justify-center p-6 font-mono">
          <div className="max-w-xl w-full bg-[#0D0F17] border border-red-500/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">خطای برنامه (Application Error)</h1>
                <p className="text-xs text-slate-400">یک انحراف غیرمنتظره در رندرینگ برنامه رخ داده است.</p>
              </div>
            </div>

            <div className="bg-[#05060A] border border-slate-800 rounded-xl p-3 text-xs overflow-auto max-h-48 font-mono text-red-300">
              <p className="font-bold">{this.state.error?.toString()}</p>
              {this.state.errorInfo && (
                <pre className="mt-2 text-[10px] text-slate-500 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-black font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>بازنشانی و بارگیری مجدد برنامه (Reload App)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
