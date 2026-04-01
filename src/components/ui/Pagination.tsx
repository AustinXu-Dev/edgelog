'use client';

import Link from 'next/link';

interface Props {
  page: number;
  totalPages: number;
  basePath: string;
  filterParams?: Record<string, string>;
}

export function Pagination({ page, totalPages, basePath, filterParams = {} }: Props) {
  function buildUrl(p: number) {
    const params = new URLSearchParams({ ...filterParams, page: String(p) });
    return `${basePath}?${params.toString()}`;
  }
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btn = 'inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-md text-sm font-medium transition-colors';

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <Link
        href={buildUrl(page - 1)}
        aria-disabled={page === 1}
        className={`${btn} ${page === 1 ? 'pointer-events-none text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <i className="lni lni-chevron-left text-xs" />
      </Link>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            className={`${btn} ${p === page ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildUrl(page + 1)}
        aria-disabled={page === totalPages}
        className={`${btn} ${page === totalPages ? 'pointer-events-none text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <i className="lni lni-chevron-right text-xs" />
      </Link>
    </div>
  );
}
