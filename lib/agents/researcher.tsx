import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import {
  ExperimentalMessage,
  ToolCallPart,
  ToolResultPart,
  experimental_streamText
} from 'ai'
import { searchSchema } from '@/lib/schema/search'
import { Section } from '@/components/section'
import { OpenAI } from '@ai-sdk/openai'
import { BotMessage } from '@/components/message'
import Exa from 'exa-js'
import { Card } from '@/components/ui/card'
import { SearchSection } from '@/components/search-section'
import Replicate from "replicate";

export async function researcher(
  uiStream: ReturnType<typeof createStreamableUI>,
  streamText: ReturnType<typeof createStreamableValue<string>>,
  messages: ExperimentalMessage[],
  useSpecificModel?: boolean
) {
  const openai = new OpenAI({
    baseUrl: process.env.OPENAI_API_BASE, // optional base URL for proxies etc.
    apiKey: process.env.OPENAI_API_KEY, // optional API key, default to env property OPENAI_API_KEY
    organization: '' // optional organization
  })


  const searchAPI: 'tavily' | 'exa' = 'tavily'

  let fullResponse = ''
  let hasError = false
  const answerSection = (
    <Section title="回答">
      <BotMessage content={streamText.value} />
    </Section>
  )

  let isFirstToolResponse = true
  const result = await experimental_streamText({
    model: openai.chat(process.env.OPENAI_API_MODEL || 'gpt-4-turbo'),
    temperature: 0.5,
    maxTokens: 4500,
    // system: `As a professional search expert, you possess the ability to search for any information on the web.
    // For each user query, utilize the search results to their fullest potential to provide additional information and assistance in your response.
    // If there are any images relevant to your answer, be sure to include them as well.
    // Aim to directly address the user's question, augmenting your response with insights gleaned from the search results.
    // Whenever quoting or referencing information from a specific URL, always cite the source URL explicitly.
    // Please translate all into Chinese.`,
    system: `# Assistant Background

You are SoSuoMe, a helpful search assistant trained by SoSuoMe AI. All output is in Chinese。

# General Instructions

Write an accurate, detailed, and comprehensive response to the user''s INITIAL_QUERY.
Additional context is provided as "USER_INPUT" after specific questions.
Your answer should be informed by the provided "Search results".
Your answer must be precise, of high-quality, and written by an expert using an unbiased and journalistic tone.
Your answer must be written in the same language as the question, even if language preference is different.

You MUST cite the most relevant search results that answer the question. Do not mention any irrelevant results.
You MUST ADHERE to the following instructions for citing search results:
- to cite a search result, enclose its index located above the summary with brackets at the end of the corresponding sentence, for example "Ice is less dense than water."  or "Paris is the capital of France."
- NO SPACE between the last word and the citation, and ALWAYS use brackets. Only use this format to cite search results. NEVER include a References section at the end of your answer.
- If you don't know the answer or the premise is incorrect, explain why.
If the search results are empty or unhelpful, answer the question as well as you can with existing knowledge.

You MUST NEVER use moralization or hedging language. AVOID using the following phrases:
- "It is important to ..."
- "It is inappropriate ..."
- "It is subjective ..."

You MUST ADHERE to the following formatting instructions:
- Use markdown to format paragraphs, lists, tables, and quotes whenever possible.
- Use headings level 2 and 3 to separate sections of your response, like "## Header", but NEVER start an answer with a heading or title of any kind.
- Use single new lines for lists and double new lines for paragraphs.
- Use markdown to render images given in the search results.
- NEVER write URLs or links.

# Query type specifications

You must use different instructions to write your answer based on the type of the user's query. However, be sure to also follow the General Instructions, especially if the query doesn't match any of the defined types below. Here are the supported types.

## Academic Research

You must provide long and detailed answers for academic research queries. 
Your answer should be formatted as a scientific write-up, with paragraphs and sections, using markdown and headings.

## Recent News

You need to concisely summarize recent news events based on the provided search results, grouping them by topics.
You MUST ALWAYS use lists and highlight the news title at the beginning of each list item.
You MUST select news from diverse perspectives while also prioritizing trustworthy sources.
If several search results mention the same news event, you must combine them and cite all of the search results. Prioritize more recent events, ensuring to compare timestamps.
You MUST NEVER start your answer with a heading of any kind.

## Weather

Your answer should be very short and only provide the weather forecast. 
If the search results do not contain relevant weather information, you must state that you don't have the answer.

## People

You need to write a short biography for the person mentioned in the query. 
If search results refer to different people, you MUST describe each person individually and AVOID mixing their information together.
NEVER start your answer with the person's name as a header.

## Coding

You MUST use markdown code blocks to write code, specifying the language for syntax highlighting, for example \`\`\`bash or \`\`\`python
If the user's query asks for code, you should write the code first and then explain it.

## Cooking Recipes

You need to provide step-by-step cooking recipes, clearly specifying the ingredient, the amount, and precise instructions during each step.

## Translation

If a user asks you to translate something, you must not cite any search results and should just provide the translation.

## Creative Writing

If the query requires creative writing, you DO NOT need to use or cite search results, and you may ignore General Instructions pertaining only to search. You MUST follow the user's instructions precisely to help the user write exactly what they need. 

## Science and Math

If the user query is about some simple calculation, only answer with the final result.
Follow these rules for writing formulas:
- Always use $$ and$$ for inline formulas and$$ and$$ for blocks, for example$$x^4 = x - 3 $$
- To cite a formula add citations to the end, for example$$ \\sin(x) $$  or $$x^2-2$$ .
- Never use $ or $$ to render LaTeX, even if it is present in the user query.
- Never use unicode to render math expressions, ALWAYS use LaTeX.
- Never use the \\label instruction for LaTeX.

## URL Lookup

When the user's query includes a URL, you must rely solely on information from the corresponding search result.
DO NOT cite other search results, ALWAYS cite the first result, e.g. you need to end with.
If the user's query consists only of a URL without any additional instructions, you should summarize the content of that URL.

## Shopping

If the user query is about shopping for a product, you MUST follow these rules:
- Organize the products into distinct sectors. For example, you could group shoes by style (boots, sneakers, etc.)
- Cite at most 5 search results using the format provided in General Instructions to avoid overwhelming the user with too many options.
None
Current date: 08:18AM Saturday, April 20, 2024

All output is in Chinese。
`,
    messages,
    tools: {
      search: {
        description: 'Search the web for information',
        parameters: searchSchema,
        execute: async ({
          query,
          max_results,
          search_depth
        }: {
          query: string
          max_results: number
          search_depth: 'basic' | 'advanced'
        }) => {
          // If this is the first tool response, remove spinner
          if (isFirstToolResponse) {
            isFirstToolResponse = false
            uiStream.update(null)
          }
          // Append the search section
          const streamResults = createStreamableValue<string>()
          uiStream.append(<SearchSection result={streamResults.value} />)

          // Tavily API requires a minimum of 5 characters in the query
          const filledQuery =
            query.length < 5 ? query + ' '.repeat(5 - query.length) : query
          let searchResult
          try {
            searchResult =
              searchAPI === 'tavily'
                ? await tavilySearch(filledQuery, max_results, search_depth)
                : await exaSearch(query)
          } catch (error) {
            console.error('Search API error:', error)
            hasError = true
          }

          if (hasError) {
            fullResponse += `\nAn error occurred while searching for "${query}.`
            uiStream.update(
              <Card className="p-4 mt-2 text-sm">
                {`An error occurred while searching for "${query}".`}
              </Card>
            )
            return searchResult
          }
          streamResults.done(JSON.stringify(searchResult))

          return searchResult
        }
      },
      stickers: {
        description: 'Call this tool to draw stickers',
        parameters: searchSchema,
        execute: async ({
                          query
                        }: {
          query: string
        }) => {
          // If this is the first tool response, remove spinner
          const replicate = new Replicate()

          const input = {
            output_quality: 50,
            prompt: query,
            number_of_images: 1,
          };

          const output = await replicate.run("fofr/sticker-maker:4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a", { input });
          // If this is the first tool response, remove spinner
          if (isFirstToolResponse) {
            isFirstToolResponse = false
            uiStream.update(null)
          }
          // Append the search section
          const streamResults = createStreamableValue<string>()
          uiStream.append(<SearchSection result={streamResults.value} />)
          const stickers = [{
            src: output,
            alt: query
          }]
          const json_stickers = JSON.stringify(stickers)
          streamResults.done(json_stickers)
          return streamResults
        }
      }
    }
  })


  const toolCalls: ToolCallPart[] = []
  const toolResponses: ToolResultPart[] = []
  for await (const delta of result.fullStream) {
    switch (delta.type) {
      case 'text-delta':
        if (delta.textDelta) {
          // If the first text delata is available, add a ui section
          if (fullResponse.length === 0 && delta.textDelta.length > 0) {
            // Update the UI
            uiStream.update(answerSection)
          }

          fullResponse += delta.textDelta
          streamText.update(fullResponse)
        }
        break
      case 'tool-call':
        toolCalls.push(delta)
        break
      case 'tool-result':
        // Append the answer section if the specific model is not used
        if (!useSpecificModel && toolResponses.length === 0) {
          uiStream.append(answerSection)
        }
        toolResponses.push(delta)
        break
      case 'error':
        hasError = true
        fullResponse += `\nError occurred while executing the tool`
        break
    }
  }
  messages.push({
    role: 'assistant',
    content: [{ type: 'text', text: fullResponse }, ...toolCalls]
  })

  if (toolResponses.length > 0) {
    // Add tool responses to the messages
    messages.push({ role: 'tool', content: toolResponses })
  }

  return { result, fullResponse, hasError, toolResponses }
}

async function tavilySearch(
  query: string,
  maxResults: number = 10,
  searchDepth: 'basic' | 'advanced' = 'basic'
): Promise<any> {
  const apiKey = process.env.TAVILY_API_KEY
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: maxResults < 5 ? 5 : maxResults,
      search_depth: searchDepth,
      include_images: true,
      include_answers: true
    })
  })

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`)
  }

  const data = await response.json()
  return data
}

async function DuckDuckGoSearch(
    query: string,
    maxResults: number = 10,
    searchDepth: 'basic' | 'advanced' = 'basic'
): Promise<any> {

  // 编码查询词以适用于URL
  const encodedQuery = encodeURIComponent(query);

  const url = `http://duckduckgo.sosuo.me/search?q=${encodedQuery}&max_results=${maxResults}`;

  console.log(url)
  const response = await fetch(url, {
    method: 'GET',
  })

  console.log(response.text())

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`)
  }

  const data = await response.json()
  return data
}

async function exaSearch(query: string, maxResults: number = 10): Promise<any> {
  const apiKey = process.env.EXA_API_KEY
  const exa = new Exa(apiKey)
  return exa.searchAndContents(query, {
    highlights: true,
    numResults: maxResults
  })
}
