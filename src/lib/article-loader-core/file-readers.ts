import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { validateArticleData, type ArticleData } from '../schemas/article';
import { logger } from '../logger';
import { FileOperationError, ValidationError, DataLoadError } from '../errors';
import { transformLegacyJsonData } from './data-transformer';

/**
 * YAML形式の条文データを読み込み、Zodで検証する
 * @param filePath YAMLファイルのパス
 * @returns 検証済み条文データ
 */
export async function loadArticleFromYaml(filePath: string): Promise<ArticleData> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(fileContent);

    // Zodで検証
    const validatedData = validateArticleData(rawData);
    return validatedData;
  } catch (error) {
    logger.error(`Failed to load article from ${filePath}`, error, { filePath });

    if (error instanceof z.ZodError) {
      throw new ValidationError(`条文データの形式が不正です: ${path.basename(filePath)}`, {
        filePath,
        zodErrors: error.issues,
      });
    }

    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new FileOperationError('読み込み', filePath, error);
    }

    throw new DataLoadError(`条文データの読み込みに失敗しました: ${path.basename(filePath)}`, {
      filePath,
    });
  }
}

/**
 * JSON形式の条文データを読み込み、Zodで検証する（互換性のため）
 * @param filePath JSONファイルのパス
 * @returns 検証済み条文データ
 */
export async function loadArticleFromJson(filePath: string): Promise<ArticleData> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const rawData = JSON.parse(fileContent);

    // 旧形式から新形式への変換
    const mappedData = transformLegacyJsonData(rawData);

    // Zodで検証
    const validatedData = validateArticleData(mappedData);
    return validatedData;
  } catch (error) {
    logger.error(`Failed to load article from ${filePath}`, error, { filePath });

    if (error instanceof z.ZodError) {
      throw new ValidationError(`条文データの形式が不正です: ${path.basename(filePath)}`, {
        filePath,
        zodErrors: error.issues,
      });
    }

    if (error instanceof SyntaxError) {
      throw new ValidationError(`JSONの解析に失敗しました: ${path.basename(filePath)}`, {
        filePath,
      });
    }

    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new FileOperationError('読み込み', filePath, error);
    }

    throw new DataLoadError(`条文データの読み込みに失敗しました: ${path.basename(filePath)}`, {
      filePath,
    });
  }
}
