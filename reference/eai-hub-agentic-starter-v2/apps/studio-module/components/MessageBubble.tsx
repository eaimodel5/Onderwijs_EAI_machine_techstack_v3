
import React from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MessageBubbleProps {
  message: Message;
  themeClasses?: string; // Optional custom classes for theming
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, themeClasses }) => {
  const isUser = message.role === 'user';
  
  // Default user style if no theme provided - added backdrop-blur and lower opacity bg
  const userStyle = themeClasses || 'bg-blue-600/10 border-blue-500/30 text-blue-100 backdrop-blur-sm';
  const modelStyle = 'bg-slate-800/40 border border-slate-700 text-slate-300 backdrop-blur-sm shadow-sm';
  const errorStyle = 'bg-red-900/20 border-red-500/50 text-red-400 backdrop-blur-sm';

  // Check if repair happened
  const wasRepaired = message.mechanical && message.mechanical.repairAttempts && message.mechanical.repairAttempts > 0;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[95%] sm:max-w-[85%] rounded-xl p-4 text-sm leading-relaxed border relative group transition-all duration-300 ${
          message.isError ? errorStyle : (isUser ? userStyle : modelStyle)
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isUser ? 'opacity-80' : 'text-slate-500'}`}>
                    {isUser ? 'OPERATOR' : 'EAI CORE'}
                </span>
                
                {/* Repair Badge */}
                {wasRepaired && (
                    <div className="flex items-center gap-1 bg-green-900/30 border border-green-500/30 rounded px-1.5 py-0.5" title="System automatically repaired malformed output">
                        <span className="text-[10px] text-green-400">⚡ FIXED</span>
                    </div>
                )}
            </div>
            
            <span className="text-[9px] text-slate-600 font-mono">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
        </div>

        <div className="markdown-body">
            {isUser ? (
                 <p className="whitespace-pre-wrap font-sans">{message.text}</p>
            ) : (
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]}
                    // Pass options to rehypeKatex to be less strict about LaTeX syntax
                    rehypePlugins={[[rehypeKatex, { strict: false }]]}
                    components={{
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-2 mt-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold text-white mb-2 mt-2" {...props} />,
                        
                        // EAI DATA GRID TABLE STYLING
                        table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-4 rounded-lg border border-slate-700/50 bg-[#0f172a]/80 backdrop-blur-sm shadow-inner">
                                <table className="w-full text-left text-xs sm:text-sm border-collapse" {...props} />
                            </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-slate-800/80 text-cyan-400 border-b border-slate-700 uppercase font-bold tracking-wider" {...props} />,
                        tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-800/50" {...props} />,
                        tr: ({node, ...props}) => <tr className="hover:bg-white/5 transition-colors" {...props} />,
                        th: ({node, ...props}) => <th className="px-4 py-3 font-mono whitespace-nowrap text-[10px] sm:text-xs" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-3 align-top border-l border-slate-800/30 first:border-l-0 text-slate-300" {...props} />,

                        // CODE BLOCKS
                        code: ({node, ...props}) => <code className="bg-black/30 text-amber-300 px-1.5 py-0.5 rounded font-mono text-xs border border-white/5 mx-0.5" {...props} />,
                        
                        // PREFORMATTED (Formulas/Code blocks)
                        pre: ({node, ...props}) => (
                            <pre className="bg-[#0b1120] border border-slate-700 rounded-lg p-4 overflow-x-auto my-4 text-xs font-mono text-cyan-100 shadow-lg shadow-black/20" {...props} />
                        ),
                        
                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-cyan-500/50 pl-3 italic text-slate-400 my-2 bg-cyan-900/10 py-1 pr-2 rounded-r" {...props} />,
                    }}
                >
                    {message.text}
                </ReactMarkdown>
            )}
        </div>
        
        {/* Debug Info on Hover (Desktop) */}
        {!isUser && message.mechanical && (
            <div className="hidden group-hover:block absolute -bottom-5 right-0 text-[9px] text-slate-600 font-mono bg-black/80 px-2 py-0.5 rounded transition-opacity border border-white/5 backdrop-blur-md z-10">
                {message.mechanical.model} | {message.mechanical.latencyMs}ms
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
