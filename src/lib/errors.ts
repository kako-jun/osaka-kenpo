/**
 * カスタムエラークラス定義
 *
 * アプリケーション全体で統一されたエラーハンドリングを提供します。
 */

/**
 * 基底エラークラス
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // スタックトレースを正しく設定
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * データ検証エラー（400 Bad Request）
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, true, context);
  }
}

/**
 * リソースが見つからないエラー（404 Not Found）
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource}が見つかりません: ${identifier}`
      : `${resource}が見つかりません`;
    super(message, 404, true, { resource, identifier });
  }
}

/**
 * データ読み込みエラー（500 Internal Server Error）
 */
export class DataLoadError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 500, true, context);
  }
}

/**
 * ファイル操作エラー（500 Internal Server Error）
 */
export class FileOperationError extends AppError {
  constructor(operation: string, filePath: string, originalError?: Error) {
    const message = `ファイル${operation}に失敗しました: ${filePath}`;
    super(message, 500, true, {
      operation,
      filePath,
      originalError: originalError?.message,
    });
  }
}

/**
 * API呼び出しエラー（502 Bad Gateway）
 */
export class ExternalApiError extends AppError {
  constructor(apiName: string, message: string, context?: Record<string, unknown>) {
    super(`${apiName} APIエラー: ${message}`, 502, true, context);
  }
}

/**
 * データベース操作エラー（500 Internal Server Error）
 */
export class DatabaseError extends AppError {
  constructor(operation: string, details?: string) {
    const message = details
      ? `データベース${operation}エラー: ${details}`
      : `データベース${operation}エラー`;
    super(message, 500, true, { operation, details });
  }
}

/**
 * エラーがAppErrorのインスタンスかどうかを判定
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * エラーからユーザー向けメッセージを生成
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '予期しないエラーが発生しました';
}

/**
 * エラーレスポンスの生成
 */
export interface ErrorResponse {
  message: string;
  statusCode: number;
  context?: Record<string, unknown>;
  timestamp: string;
}

export function createErrorResponse(error: unknown): ErrorResponse {
  if (isAppError(error)) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      context: error.context,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    message: getUserFriendlyMessage(error),
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };
}
