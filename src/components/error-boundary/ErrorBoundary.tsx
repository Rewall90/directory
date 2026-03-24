"use client";

import { Component, type ReactNode } from "react";
import { logger } from "@/lib/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary caught error", { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="flex h-full items-center justify-center p-8"
            role="alert"
            aria-live="assertive"
          >
            <div className="text-center">
              <h2 className="mb-4 text-xl font-bold">Map Failed to Load</h2>
              <p className="text-base-content/70 mb-4">
                There was an error loading the map. Please refresh the page.
              </p>
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
