'use client'

import { cn } from '@/lib/utils'
import {
  BookCheck,
  Image, Link2,
  MessageCircleMore,
  Newspaper,
  Repeat2,
  Search
} from 'lucide-react'
import React from 'react'
import { Separator } from './ui/separator'

type SectionProps = {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  title?: string
  separator?: boolean
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  size = 'md',
  title,
  separator = false
}) => {
  let icon: React.ReactNode
  switch (title) {
    case '图片':
      // eslint-disable-next-line jsx-a11y/alt-text
      icon = <Image size={18} className="mr-2" />
      break
    case '相关搜索':
      icon = <Newspaper size={18} className="mr-2" />
      break
    case '回答':
      icon = <BookCheck size={18} className="mr-2" />
      break
    case '参考链接':
      icon = <Link2 size={18} className="mr-2" />
      break
    case '进一步搜索':
      icon = <MessageCircleMore size={18} className="mr-2" />
      break
    default:
      icon = <Search size={18} className="mr-2" />
  }

  return (
    <>
      {separator && <Separator className="my-2 bg-primary/10" />}
      <section
        className={cn(
          ` ${size === 'sm' ? 'py-1' : size === 'lg' ? 'py-4' : 'py-2'}`,
          className
        )}
      >
        {title && (
          <h2 className="flex items-center text-lg leading-none py-2">
            {icon}
            {title}
          </h2>
        )}
        {children}
      </section>
    </>
  )
}
