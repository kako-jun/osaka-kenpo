export function OperationHint() {
  return (
    <div className="mt-8 text-center">
      <p className="text-sm text-gray-500 mb-2">簡単操作</p>
      <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
        <span>🖱️ クリック、⌨️ スペースキー：言語の切り替え</span>
        <span>📱 スワイプ、⌨️ ← → キー：前後の条文へ</span>
      </div>
    </div>
  );
}
