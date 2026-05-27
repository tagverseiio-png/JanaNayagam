import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Map Load Error Caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/50 rounded-2xl text-center space-y-3">
          <p className="text-sm font-black text-[#8B1A1A] dark:text-rose-400">
            Map Error: Failed to render Leaflet container.
          </p>
          <p className="text-xs text-slate-500">
            Please ensure you are connected to the network or refresh the browser session.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
