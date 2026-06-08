'use client';

import { AFFILIATE_PRODUCTS } from '@/data/affiliateProducts';

export function AffiliateGrid() {
  return (
    <section aria-label="Amazonアソシエイト商品" className="mt-4 w-full">
      <ul className="grid list-none grid-cols-3 gap-3 p-0 sm:gap-4">
        {AFFILIATE_PRODUCTS.map((product) => (
          <li key={product.url}>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              title={product.title}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]"
            >
              <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full bg-[#FFF8DC] shadow-inner transition-transform duration-200 ease-out group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                  width={160}
                  height={160}
                  className="absolute inset-0 h-full w-full scale-110 object-cover transition-transform duration-200 ease-out group-hover:scale-[1.18]"
                  onError={(event) => {
                    event.currentTarget.style.visibility = 'hidden';
                  }}
                />
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs leading-tight text-gray-600">{product.caption}</p>
                <p className="mt-0.5 text-xs leading-tight text-gray-500">{product.title}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-xs text-gray-600">
        Amazonアソシエイトリンクです。買ってもろたら、このサイトの運営費になります。
      </p>
    </section>
  );
}
