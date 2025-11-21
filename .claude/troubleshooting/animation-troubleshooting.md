# アニメーション関連のトラブルシューティング

## AnimatedContentコンポーネントについて

### 基本構造

```tsx
interface AnimatedContentProps {
  originalContent: React.ReactNode;
  osakaContent: React.ReactNode;
  showOsaka: boolean;
  className?: string;
}
```

### 正しい使用方法

```tsx
<AnimatedContent
  showOsaka={showOsaka}
  originalContent={
    <div className="text-gray-800">
      <span dangerouslySetInnerHTML={{ __html: originalText }} />
    </div>
  }
  osakaContent={
    <div className="text-gray-800">
      <span>{osakaText}</span>
    </div>
  }
/>
```

## よくある問題と解決法

### 1. HTMLタグが見える問題

**症状:** 切り替え時に`<ruby>`などのHTMLタグが一瞬表示される

**原因:**

- originalContentとosakaContentで同じデータを使用している
- `dangerouslySetInnerHTML`の使い分けができていない

**解決法:**

```tsx
// ❌ 悪い例
const displayTitle = showOsaka ? osakaTitle : originalTitle
<AnimatedContent
  originalContent={<span>{displayTitle}</span>}
  osakaContent={<span>{displayTitle}</span>}
/>

// ✅ 良い例
<AnimatedContent
  originalContent={<span dangerouslySetInnerHTML={{ __html: originalTitle }} />}
  osakaContent={<span>{osakaTitle}</span>}
/>
```

### 2. アニメーションが瞬間的になる問題

**症状:** フェード効果がなく、一瞬で切り替わる

**原因:**

- 古いAPIの`content`プロパティを使用している
- keyの指定による強制再レンダリング

**解決法:**

```tsx
// ❌ 悪い例（古いAPI）
<AnimatedContent
  key={`content-${viewMode}`}  // keyで強制再レンダリング
  content={<span>{content}</span>}
/>

// ✅ 良い例（新しいAPI）
<AnimatedContent
  showOsaka={showOsaka}
  originalContent={<span>{originalContent}</span>}
  osakaContent={<span>{osakaContent}</span>}
/>
```

### 3. 透明度が完全に0にならない問題

**症状:** 非表示になるべきコンテンツが薄っすら見える

**解決法:** AnimatedContentコンポーネントの確認

```tsx
// opacity設定を確認
style={{
  opacity: showOsaka ? 0 : 1,  // 0.1ではなく0にする
  position: showOsaka ? 'absolute' : 'relative',
}}
```

### 4. 切り替え操作について

#### キーボードショートカット

```tsx
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.code === 'Space' &&
      !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)
    ) {
      event.preventDefault();
      toggleViewMode();
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [viewMode, setViewMode]);
```

#### ダブルクリック/タップ

```tsx
<div
  onDoubleClick={toggleViewMode}
  title="ダブルクリックまたはスペースキーで表示を切り替え"
>
  <AnimatedContent ... />
</div>
```

## ViewModeToggle関連

### レスポンシブ対応

```tsx
// モバイルでは短縮表示
<span className="sm:hidden">お</span>
<span className="hidden sm:inline">おおさか</span>
```

### 位置調整の問題

**症状:** トグルボタンの左右のスペースが不均等

**解決法:** translateX値を調整

```tsx
style={{ transform: isOsaka ? 'translateX(0)' : 'translateX(100%)' }}
```

## デバッグのコツ

### 1. コンソールでの状態確認

```tsx
console.log('showOsaka:', showOsaka);
console.log('originalContent:', originalContent);
console.log('osakaContent:', osakaContent);
```

### 2. CSSトランジションの確認

```css
.transition-opacity {
  transition: opacity 500ms ease-in-out;
}
```

### 3. ブラウザ開発者ツールでの確認

- Elements タブで opacity の値をリアルタイム確認
- Network タブでAPIレスポンスの内容確認
- Console タブでJavaScriptエラーの確認

## パフォーマンス最適化

### 1. 不要な再レンダリングの防止

```tsx
// keyを使った強制再レンダリングは避ける
// 代わりにpropsの変更でアニメーション制御
```

### 2. メモ化の活用

```tsx
const memoizedOriginalContent = useMemo(
  () => <span dangerouslySetInnerHTML={{ __html: originalText }} />,
  [originalText]
);
```

## 今後の課題

- アニメーション速度の設定可能化
- より複雑なトランジション効果の実装
- アクセシビリティの向上（prefers-reduced-motion対応）
