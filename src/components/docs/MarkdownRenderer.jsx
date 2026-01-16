import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';

/**
 * MarkdownRenderer - Render Markdown content to safe HTML
 * Supports: headings, bold, italic, lists, links, code blocks, tables, quotes
 * XSS protected via rehype-sanitize
 */
const MarkdownRenderer = ({ content, className = '' }) => {
    if (!content) {
        return (
            <div className="text-gray-400 dark:text-white/40 italic">
                Không có nội dung
            </div>
        );
    }

    return (
        <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                components={{
                    // Custom styling cho các elements
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-white/10">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-bold mt-6 mb-3 text-[#1d2624] dark:text-white">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-5 mb-2 text-[#1d2624] dark:text-white">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="text-[#1d2624]/80 dark:text-white/80 leading-relaxed mb-4">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-2 mb-4 text-[#1d2624]/80 dark:text-white/80">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-2 mb-4 text-[#1d2624]/80 dark:text-white/80">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark underline decoration-primary/30 hover:decoration-primary transition-colors"
                        >
                            {children}
                        </a>
                    ),
                    code: ({ inline, className, children }) => {
                        if (inline) {
                            return (
                                <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-sm font-mono text-[#1d2624] dark:text-white">
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={`${className} block p-4 rounded-xl bg-gray-900 dark:bg-black/50 text-gray-100 text-sm overflow-x-auto`}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="rounded-xl overflow-hidden mb-4">
                            {children}
                        </pre>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/50 pl-4 py-2 my-4 bg-primary/5 rounded-r-lg text-[#1d2624]/80 dark:text-white/80 italic">
                            {children}
                        </blockquote>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full border-collapse border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border border-gray-200 dark:border-white/10 px-4 py-2 bg-gray-50 dark:bg-white/5 font-semibold text-left">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-gray-200 dark:border-white/10 px-4 py-2">
                            {children}
                        </td>
                    ),
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt}
                            className="rounded-xl max-w-full h-auto my-4 shadow-lg"
                            loading="lazy"
                        />
                    ),
                    hr: () => (
                        <hr className="my-8 border-gray-200 dark:border-white/10" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
