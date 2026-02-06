/**
 * ロギングユーティリティ
 *
 * 開発環境ではコンソールに出力し、本番環境では必要最小限のログのみ出力します。
 * 将来的には外部ロギングサービス（Sentry等）に送信することも可能です。
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // Next.jsの環境変数を使用
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * デバッグログ（開発環境のみ）
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * 情報ログ（開発環境のみ）
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * 警告ログ（常に出力）
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * エラーログ（常に出力）
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails =
      error instanceof Error ? { message: error.message, stack: error.stack } : error;

    console.error(`[ERROR] ${message}`, errorDetails, context || '');

    // 将来的にはここでSentry等の外部サービスに送信
    // if (this.isProduction) {
    //   Sentry.captureException(error, { extra: context });
    // }
  }

  /**
   * カスタムログレベル
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case 'debug':
        this.debug(message, context);
        break;
      case 'info':
        this.info(message, context);
        break;
      case 'warn':
        this.warn(message, context);
        break;
      case 'error':
        this.error(message, undefined, context);
        break;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const logger = new Logger();

// 型もエクスポート
export type { LogLevel, LogContext };
