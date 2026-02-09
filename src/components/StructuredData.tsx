import { ArticleData } from '@/lib/types';

interface WebsiteStructuredDataProps {
  name?: string;
  description?: string;
  url?: string;
}

interface ArticleStructuredDataProps {
  article: ArticleData;
  lawName: string;
  lawCategory: string;
  lawId: string;
}

/**
 * ウェブサイト用構造化データ
 */
export function WebsiteStructuredData({
  name = 'おおさかけんぽう',
  description = '法律をおおさか弁で親しみやすく解説するサイト',
  url = 'https://osaka-kenpo.llll-ll.com',
}: WebsiteStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    inLanguage: 'ja',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'おおさかけんぽう',
      url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * 条文用構造化データ
 */
export function ArticleStructuredData({
  article,
  lawName,
  lawCategory,
  lawId,
}: ArticleStructuredDataProps) {
  const articleNumber =
    typeof article.article === 'number'
      ? `第${article.article}条`
      : article.article.startsWith('suppl-')
        ? `附則第${article.article.replace('suppl-', '')}条`
        : `第${article.article}条`;

  const title = `${lawName} ${articleNumber}`;
  const url = `https://osaka-kenpo.llll-ll.com/law/${lawCategory}/${lawId}/${article.article}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    name: title,
    description: article.osakaText?.[0] || article.originalText[0],
    url,
    inLanguage: 'ja',
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'おおさかけんぽう',
    },
    publisher: {
      '@type': 'Organization',
      name: 'おおさかけんぽう',
      url: 'https://osaka-kenpo.llll-ll.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    isPartOf: {
      '@type': 'LegalDocument',
      name: lawName,
      url: `https://osaka-kenpo.llll-ll.com/law/${lawCategory}/${lawId}`,
      inLanguage: 'ja',
    },
    text: article.originalText.join('\n'),
    alternativeHeadline: article.osakaText.join('\n'),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * 法律文書用構造化データ
 */
export function LegalDocumentStructuredData({
  lawName,
  lawDescription,
  lawCategory,
  lawId,
  articles = [],
}: {
  lawName: string;
  lawDescription: string;
  lawCategory: string;
  lawId: string;
  articles?: string[];
}) {
  const url = `https://osaka-kenpo.llll-ll.com/law/${lawCategory}/${lawId}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LegalDocument',
    name: lawName,
    description: lawDescription,
    url,
    inLanguage: 'ja',
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'おおさかけんぽう',
      url: 'https://osaka-kenpo.llll-ll.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    hasPart: articles.map((articleId) => ({
      '@type': 'Article',
      url: `${url}/${articleId}`,
      isPartOf: {
        '@type': 'LegalDocument',
        name: lawName,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
