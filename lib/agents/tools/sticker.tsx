import { retrieveSchema } from '@/lib/schema/retrieve'
import { ToolsProps } from '.'
import {searchSchema} from "@/lib/schema/search";
import {createStreamableValue} from "ai/rsc";
import Replicate from "replicate";

export const stickerTool = ({
                                 uiStream,
                                 fullResponse,
                                 isFirstToolResponse,
                                 messages
                             }: ToolsProps) => ({
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

        // Append the search section
        const streamResults = createStreamableValue<string>()
        const stickers = {
            query: query,
            stickers: [{
                src: output,
                alt: query
            }]
        }
        const json_stickers = JSON.stringify(stickers)
        uiStream.update(<></>)
        streamResults.done(json_stickers)
        return streamResults
    }})