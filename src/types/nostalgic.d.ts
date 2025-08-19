declare namespace JSX {
  interface IntrinsicElements {
    'nostalgic-counter': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        id?: string;
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
        theme?: 'classic' | 'modern' | 'retro';
        digits?: string;
      },
      HTMLElement
    >;
  }
}