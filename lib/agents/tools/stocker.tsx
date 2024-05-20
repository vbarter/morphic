import { retrieveSchema } from '@/lib/schema/retrieve'
import { ToolsProps } from '.'
import {searchSchema} from "@/lib/schema/search";
import {createStreamableValue} from "ai/rsc";

export const stockerTool = ({
                                 uiStream,
                                 fullResponse,
                                 isFirstToolResponse,
                                 messages
                             }: ToolsProps) => ({
    description: 'Stock Analysis Tools',
    parameters: searchSchema,
    execute: async ({
                        query
                    }: {
    query: string
}) => {
    // If this is the first tool response, remove spinner
    const streamResults = createStreamableValue<string>()
    const new_query: string = JSON.parse(messages![messages!.length - 1].content as string).input
    console.log(new_query)
    const headers = {
        Authorization: `Bearer ${process.env.COZE_PERSONAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Host': 'api.coze.com',
        'Connection': 'keep-alive',
    };

    const json_body = {
        conversation_id: "222",
        bot_id: "7363570359524048902",
        user: "1",
        query: new_query,
        stream: false,
    }
    const response = await fetch('https://api.coze.com/open_api/v2/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(json_body)
    })

    if (!response.ok) {
        uiStream.update(<></>)
        streamResults.done()
        return null
    }

    const data = await response.json()
    console.log("data", data)
    uiStream.update(<></>)
    streamResults.done(JSON.stringify(data))
    return data
    }})