const svgProps = {
  className: 'w-full h-full',
  viewBox: '0 0 24 24',
  xmlns: 'http://www.w3.org/2000/svg',
} as const;

export function XIcon() {
  return (
    <svg {...svgProps} fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function NoteIcon() {
  return (
    <svg {...svgProps} fill="none">
      <rect width="24" height="24" rx="12" fill="#1A1A1A" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="bold"
        fontFamily="serif"
      >
        n
      </text>
    </svg>
  );
}

export function HatenaIcon() {
  return (
    <svg {...svgProps} fill="none">
      <rect width="24" height="24" rx="4" fill="#00A4DE" />
      <text
        x="12"
        y="18"
        textAnchor="middle"
        fill="white"
        fontSize="15"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        B!
      </text>
    </svg>
  );
}

export function LineIcon() {
  return (
    <svg {...svgProps} fill="#06C755">
      <path d="M24 10.304C24 4.612 18.624.2 12 .2S0 4.612 0 10.304c0 5 4.436 9.192 10.428 9.985.406.088.958.268 1.098.615.124.314.082.798.04 1.112l-.17 1.062c-.052.314-.248 1.232 1.088.672 1.336-.56 7.2-4.24 9.82-7.256C23.916 14.516 24 12.5 24 10.304zM7.848 13.18H5.844c-.36 0-.648-.288-.648-.648V8.09c0-.36.288-.648.648-.648.36 0 .648.288.648.648v3.792h1.356c.36 0 .648.29.648.65 0 .36-.288.648-.648.648zm2.58-.648c0 .36-.288.648-.648.648-.36 0-.648-.288-.648-.648V8.09c0-.36.288-.648.648-.648.36 0 .648.288.648.648v4.444zm5.1 0c0 .282-.18.53-.444.618-.066.022-.138.032-.206.032-.216 0-.404-.094-.528-.26l-2.532-3.444v3.054c0 .36-.288.648-.648.648-.36 0-.648-.288-.648-.648V8.09c0-.28.18-.53.444-.618.066-.022.138-.032.206-.032.216 0 .402.094.528.26l2.532 3.444V8.09c0-.36.29-.648.65-.648.36 0 .648.288.648.648v4.444zm3.886-2.87h-1.82v-1.17h1.82c.36 0 .648-.282.648-.648 0-.36-.288-.648-.648-.648h-2.468c-.36 0-.648.288-.648.648v4.45c0 .358.288.644.648.644h2.468c.36 0 .648-.288.648-.648 0-.36-.288-.648-.648-.648h-1.82v-1.17h1.82c.36 0 .648-.288.648-.648 0-.36-.288-.648-.648-.648z" />
    </svg>
  );
}

export function FacebookIcon() {
  return (
    <svg {...svgProps} fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export const brandIcons: Record<string, () => JSX.Element> = {
  x: XIcon,
  note: NoteIcon,
  hatena: HatenaIcon,
  line: LineIcon,
  facebook: FacebookIcon,
};
