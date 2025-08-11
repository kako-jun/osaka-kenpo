import { useSpeech } from '@/hooks/useSpeech'

interface SpeakerButtonProps {
  text: string
  voice: 'male' | 'female'
  className?: string
}

export const SpeakerButton = ({ text, voice, className = '' }: SpeakerButtonProps) => {
  const { speak, stop, isSpeaking, isSupported } = useSpeech()

  if (!isSupported) {
    return null // ブラウザが対応していない場合は表示しない
  }

  const handleClick = () => {
    if (isSpeaking) {
      stop()
    } else {
      speak(text, { voice })
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center
        w-10 h-10 rounded-full
        bg-gray-100 hover:bg-gray-200
        text-gray-600 hover:text-gray-800
        transition-all duration-200
        shadow-sm hover:shadow-md
        ${isSpeaking ? 'animate-pulse bg-blue-100 text-blue-600' : ''}
        ${className}
      `}
      title={isSpeaking ? '停止' : '音声で読み上げ'}
      type="button"
    >
      {isSpeaking ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      )}
    </button>
  )
}