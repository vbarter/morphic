import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    return new NextResponse(error.message || "Something went wrong!", {
      status: 500,
    });
  }
}
