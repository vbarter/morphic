import React, { FC, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {Option} from "commander";

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

// @ts-ignore
export const MemoizedReactMarkdown: FC<Option> = memo(({ children, className, ...props }) => (
    <ReactMarkdown
        children={children}
        className={className}
        {...props}
        components={{
            code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                    <SyntaxHighlighter
                        style={customCodeStyle}
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
), (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className);