'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { isAppError, getUserFriendlyMessage } from '@/lib/errors';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * エラーバウンダリコンポーネント
 *
 * 子コンポーネントでエラーが発生した場合にキャッチし、
 * フォールバックUIを表示します。
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーをログに記録
    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      isAppError: isAppError(error),
    });
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // カスタムフォールバックが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // デフォルトのフォールバックUI
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">😢</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">エラーが発生しました</h1>
              <p className="text-gray-600 mb-4">{getUserFriendlyMessage(this.state.error)}</p>
            </div>

            <div className="space-y-3">
              <Button onClick={this.resetError} variant="primary" size="lg" fullWidth>
                もう一度試す
              </Button>
              <a
                href="/"
                className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 font-bold rounded-lg transition-colors"
              >
                トップページに戻る
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  エラー詳細（開発環境のみ）
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 簡易版エラーバウンダリ（ページ部分用）
 */
export function PageErrorBoundary({ children }: { children: ReactNode }): ReactNode {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{getUserFriendlyMessage(error)}</p>
            <Button onClick={reset} variant="primary">
              再読み込み
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
