import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 flex flex-col items-center justify-center text-center space-y-4 my-4 shadow-xl">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {this.props.fallbackTitle || "Service Unavailable"}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              The application failed to initialize or render. Please click retry to reload the module.
            </p>
          </div>
          {this.state.error && (
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-left w-full max-w-lg font-mono text-[11px] text-rose-300 overflow-x-auto">
              {this.state.error.message || "Unknown execution error"}
            </div>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
