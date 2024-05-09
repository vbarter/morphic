import React, {FC, memo, CSSProperties, ReactNode} from 'react';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {darcula} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {Options} from "arg";
import {Root} from "hast";

// 这里定义一个自定义的 code 样式对象，用来覆盖默认的 darcula 主题样式
const customCodeStyle = {
    ...darcula,
    'code[class*="language-"]': {
        ...darcula['code[class*="language-"]'],
        fontSize: '16px',
        backgroundColor: 'none', // 移除背景颜色
    },
    'pre[class*="language-"]': {
        ...darcula['pre[class*="language-"]'],
        fontSize: '16px',
        backgroundColor: 'none', // 移除背景颜色
    },
};

interface MemoizedReactMarkdownProps {
    rehypePlugins?: [any, any][],
    remarkPlugins?: any[],
    className?: string,
    children: any,
}

export const MemoizedReactMarkdown: FC<MemoizedReactMarkdownProps> = memo(
    ({className, rehypePlugins, remarkPlugins,children,  ...props}) => (
        <ReactMarkdown
            children={children}
            className={className}
            {...props}
            components={{
                code({node, className, children}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                        <SyntaxHighlighter
                            style={customCodeStyle}// You may need to assert the type if TypeScript can't infer it correctly
                            language={match[1]}
                            PreTag="div"
                            children={String(children).replace(/\n$/, '')}
                            {...props}
                        />
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
            }}
        />
    ),
    (prevProps, nextProps) =>
        prevProps.children === nextProps.children &&
        prevProps.className === nextProps.className
);