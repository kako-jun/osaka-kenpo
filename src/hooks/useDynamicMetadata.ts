import { useEffect } from 'react'

interface DynamicMetadata {
  title?: string
  description?: string
  url?: string
  image?: string
  type?: 'website' | 'article'
}

export function useDynamicMetadata(metadata: DynamicMetadata) {
  useEffect(() => {
    if (typeof document === 'undefined') return

    // タイトル設定
    if (metadata.title) {
      document.title = metadata.title
    }

    // メタタグ設定/更新関数
    const setMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector) as HTMLMetaElement
      
      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    // 基本メタタグ
    if (metadata.description) {
      setMetaTag('description', metadata.description)
    }

    // OGP
    if (metadata.title) {
      setMetaTag('og:title', metadata.title, true)
    }
    if (metadata.description) {
      setMetaTag('og:description', metadata.description, true)
    }
    if (metadata.url) {
      setMetaTag('og:url', `https://osaka-kenpo.llll-ll.com${metadata.url}`, true)
    }
    if (metadata.type) {
      setMetaTag('og:type', metadata.type, true)
    }
    if (metadata.image) {
      setMetaTag('og:image', `https://osaka-kenpo.llll-ll.com${metadata.image}`, true)
    }

    // Twitter Cards
    if (metadata.title) {
      setMetaTag('twitter:title', metadata.title)
    }
    if (metadata.description) {
      setMetaTag('twitter:description', metadata.description)
    }
    if (metadata.image) {
      setMetaTag('twitter:image', `https://osaka-kenpo.llll-ll.com${metadata.image}`)
    }

    // canonical URL
    if (metadata.url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = `https://osaka-kenpo.llll-ll.com${metadata.url}`
    }
  }, [metadata])
}