import { OpenAI } from "openai";

export async function GET(
    request: Request,
    { params }: { params: { audiotext: string } }
) {
    try {
        if (!params.audiotext) {
            return new Response("Missing audio text", { status: 400 })
        }

        const audioText = params.audiotext

        const openAI = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY as string,
        })

        const response = await openAI.audio.speech.create({
            model: "tts-1",
            voice: "nova",
            input: audioText,
        })

        return new Response(await response.body, {status: 200, headers: {"Content-Type": "audio/mpeg"}})
    } catch (e) {
        console.log("[CHAT_AUDIO_POST]", e)
        return new Response("Internal Server Error", { status: 500 })
    }
}