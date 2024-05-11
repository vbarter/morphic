'use client'

import { SearchResults } from './search-results'
import { SearchSkeleton } from './search-skeleton'
import { SearchResultsImageSection } from './search-results-image'
import { Section } from './section'
import { ToolBadge } from './tool-badge'
import type { SearchResults as TypeSearchResults } from '@/lib/types'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import {Showcase} from "@/components/showcase";

export type SearchSectionProps = {
  result?: StreamableValue<string>
}

export function SearchSection({ result }: SearchSectionProps) {
  const [data, error, pending] = useStreamableValue(result)
  const searchResults: TypeSearchResults = data ? JSON.parse(data) : undefined
  return (
    <div>
      {!pending && data ? (
        <>
          {
            searchResults.stickers === undefined && (
                  <Section size="sm" className="pt-2 pb-0">
                    <ToolBadge tool="search">{`${searchResults.query}`}</ToolBadge>
                  </Section>
              )
          }
          {searchResults.images && searchResults.images.length > 0 && (
            <Section title="图片">
              <SearchResultsImageSection
                images={searchResults.images}
                query={searchResults.query}
              />
            </Section>
          )}
          {
            searchResults.results && searchResults.results.length > 0 && (
              <Section title="来源">
                <SearchResults results={searchResults.results} />
              </Section>
            )
          }
          {
            searchResults.stickers && searchResults.stickers.length > 0 && (
                  <div title="贴纸">
                    <img
                        src={searchResults.stickers[0].src}
                        alt={searchResults.stickers[0].alt}
                        className="h-full w-full object-cover"
                    />
                  </div>
              )
          }
        </>
      ) : (
          <Section className="pt-2 pb-0">
            <SearchSkeleton/>
          </Section>
      )}
    </div>
  )
}
