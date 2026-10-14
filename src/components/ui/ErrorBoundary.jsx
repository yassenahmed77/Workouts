'use client';
import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
/**
 * Workouts Pro — Resilient Component Error Boundary
 *
 * Prevents "White Screen of Death" by catching render/lifecycle exceptions
 * in individual views and providing a clean, non-disruptive self-healing recovery card.
 */
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
    }
    handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };
    render() {
        if (this.state.hasError) {
            return (<div className="w-full p-6 my-4 rounded-2xl bg-[var(--card-bg)] border border-rose-500/20 text-center flex flex-col items-center justify-center space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5"/>
          </div>
          <div>
            <h3 className="gym-heading-section text-white tracking-tight">
              {this.props.fallbackTitle || 'Unable to display this view'}
            </h3>
            <p className="gym-subtext max-w-md mx-auto mt-1">
              A temporary render error occurred while calculating metrics. Your underlying data is secure.
            </p>
          </div>
          <button type="button" onClick={this.handleReset} className="gym-btn-secondary gym-btn-sm inline-flex items-center gap-2 cursor-pointer shadow-sm">
            <RefreshCw className="w-3.5 h-3.5"/>
            <span>Reload View</span>
          </button>
        </div>);
        }
        return this.props.children;
    }
}
