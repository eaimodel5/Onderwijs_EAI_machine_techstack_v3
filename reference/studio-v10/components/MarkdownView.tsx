import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownViewProps {
  content: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-studio-900 prose-pre:border prose-pre:border-studio-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <div className="rounded-md overflow-hidden my-2">
                <div className="bg-studio-800 px-3 py-1 text-xs text-studio-400 font-mono border-b border-studio-700 flex justify-between">
                  <span>{match[1]}</span>
                </div>
                <div className="p-4 bg-studio-950 overflow-x-auto">
                   <code className={className} {...props}>
                    {children}
                  </code>
                </div>
              </div>
            ) : (
              <code className="bg-studio-800 rounded px-1 py-0.5 text-studio-200" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default React.memo(MarkdownView);