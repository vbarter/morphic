import { searchTool } from './search'
import { createStreamableUI } from 'ai/rsc'
import {retrieveTool} from "@/lib/agents/tools/retrieve";
import {CoreMessage} from "ai";
import {stockerTool} from "@/lib/agents/tools/stocker";

export interface ToolsProps {
    uiStream: ReturnType<typeof createStreamableUI>
    fullResponse: string
    isFirstToolResponse: boolean,
    messages:  CoreMessage[] | undefined
}

export const getTools = ({
                             uiStream,
                             fullResponse,
                             isFirstToolResponse,
                             messages
                         }: ToolsProps) => {
    const tools: any = {
        search: searchTool({
            uiStream,
            fullResponse,
            isFirstToolResponse,
            messages
        })
    }

    // 加入网页抽取工具
    if (process.env.EXA_API_KEY) {
        tools.retrieve = retrieveTool({
            uiStream,
            fullResponse,
            isFirstToolResponse,
            messages
        })
    }

    // 假如股票解析工具
    tools.stocker = stockerTool({
        uiStream,
        fullResponse,
        isFirstToolResponse,
        messages
    })


    return tools
}