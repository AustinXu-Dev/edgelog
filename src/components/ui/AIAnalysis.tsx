'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
}

export function AIAnalysis({ content }: Props) {
  return (
    <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500 mb-3">AI Coach</p>
      <div className="prose prose-sm max-w-none text-gray-700
        [&>h1]:text-sm [&>h1]:font-semibold [&>h1]:text-gray-800 [&>h1]:mt-3 [&>h1]:mb-1
        [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:text-gray-800 [&>h2]:mt-3 [&>h2]:mb-1
        [&>h3]:text-xs [&>h3]:font-semibold [&>h3]:text-gray-700 [&>h3]:uppercase [&>h3]:tracking-wide [&>h3]:mt-3 [&>h3]:mb-1
        [&>p]:text-sm [&>p]:leading-relaxed [&>p]:mb-2
        [&>ul]:text-sm [&>ul]:pl-4 [&>ul]:mb-2 [&>ul]:space-y-1
        [&>ol]:text-sm [&>ol]:pl-4 [&>ol]:mb-2 [&>ol]:space-y-1
        [&_li]:leading-relaxed
        [&_strong]:font-semibold [&_strong]:text-gray-800
        [&_em]:italic
        [&>*:first-child]:mt-0
        [&>*:last-child]:mb-0">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
