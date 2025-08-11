import { useState, useCallback } from 'react'

interface SpeechOptions {
  voice?: 'male' | 'female'
  rate?: number
  pitch?: number
  volume?: number
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false)
      console.warn('Speech Synthesis is not supported in this browser')
      return
    }

    // 既存の音声を停止
    window.speechSynthesis.cancel()

    // HTMLタグを削除してテキストのみを抽出（ルビの重複読み上げを防ぐ）
    let cleanText = text
    // ルビタグ <ruby>漢字<rt>よみ</rt></ruby> から漢字部分のみを抽出
    cleanText = cleanText.replace(/<ruby>([^<]+)<rt>[^<]*<\/rt><\/ruby>/g, '$1')
    // 残りのHTMLタグを削除
    cleanText = cleanText.replace(/<[^>]*>/g, '')

    const utterance = new SpeechSynthesisUtterance(cleanText)

    // 音声リストが読み込まれていない場合の対処
    const setupVoice = () => {
      // 音声設定のデフォルト値
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = options.volume || 0.8

      // 音声の選択
      const voices = window.speechSynthesis.getVoices()
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`))
      
      if (voices.length > 0) {
        if (options.voice === 'male') {
          // Google 日本語音声を男性用に使用
          const japaneseVoice = voices.find(voice => voice.lang.includes('ja'))
          
          if (japaneseVoice) {
            utterance.voice = japaneseVoice
            console.log('Selected voice for male:', japaneseVoice.name)
            // 男性らしい低いピッチに設定
            utterance.pitch = 0.7
          } else {
            console.log('No Japanese voice found')
          }
          utterance.rate = 0.9  // 統一速度
        } else if (options.voice === 'female') {
          // Google 日本語音声を女性用に使用
          const japaneseVoice = voices.find(voice => voice.lang.includes('ja'))
          
          if (japaneseVoice) {
            utterance.voice = japaneseVoice
            console.log('Selected voice for female:', japaneseVoice.name)
          }
          // 女性らしい設定（春日歩風だが控えめに）
          utterance.pitch = 1.1 // 少し高めに
          utterance.rate = 0.9  // 統一速度
        }
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }

    // 音声が読み込まれていない場合は少し待ってから実行
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', setupVoice, { once: true })
      // フォールバック: 1秒後に実行
      setTimeout(setupVoice, 1000)
    } else {
      setupVoice()
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    isSupported
  }
}