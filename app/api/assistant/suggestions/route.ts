import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function POST(req: Request, res: NextResponse) {
  const { messages } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: false,
      messages: messages,
    });

    const suggestions = response.choices[0].message.content?.trim().split("\n");

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.log(error.message);

    return new NextResponse(error.message || "Something went wrong!", {
      status: 500,
    });
  }
}
