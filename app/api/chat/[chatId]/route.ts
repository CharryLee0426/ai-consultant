import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs";
import { Replicate } from "langchain/llms/replicate";
import { CallbackManager } from "langchain/callbacks";
import { NextResponse } from "next/server";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(
    request: Request,
    { params }: { params: { chatId: string } }
) {
    try {
        const { prompt } = await request.json()
        const user = await currentUser()

        if (!user || !user.firstName || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const identifier = request.url + "-" + user.id
        const { success } = await rateLimit(identifier)

        if (!success) {
            return new NextResponse("Rate Limit Exceeded", { status: 429 })
        }

        const consultant = await prismadb.consultant.update({
            where: {
                id: params.chatId,
                // userId: user.id,
            },
            data: {
                messages: {
                    create: {
                        content: prompt,
                        role: "user",
                        userId: user.id,
                    }
                }
            }
        })

        if (!consultant) {
            return new NextResponse("Consultant not found", { status: 404 })
        }

        const name = consultant.id
        const consultant_file_name = name + ".txt"

        const consultantKey = {
            consultantName: name,
            userId: user.id,
            modelName: "llama2-13b",
        }

        const memoryManager = await MemoryManager.getInstance()

        const records = await memoryManager.readLatestHistory(consultantKey)

        if (records.length === 0) {
            await memoryManager.seedChatHistory(consultant.seed, "\n\n", consultantKey)
        }

        await memoryManager.writeToHistory("User: " + prompt + "\n", consultantKey)

        const recentChatHistory = await memoryManager.readLatestHistory(consultantKey)

        const similarDocs = await memoryManager.vectorSearch(
            recentChatHistory,
            consultant_file_name,
        )

        let relevantHistory = ""

        if (!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n")
        }

        const { handlers } = LangChainStream()

        const model = new Replicate({
            model: "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
            input: {
                max_length: 2048,
            },
            apiKey: process.env.REPLICATED_API_KEY as string,
            callbackManager: CallbackManager.fromHandlers(handlers),
        })

        model.verbose = true

        const resp = String(
            await model
              .call(
                `
              ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${consultant.name}: prefix. 
      
              ${consultant.instructions}
      
              Below are relevant details about ${consultant.name}'s past and the conversation you are in.
              ${relevantHistory}
      
      
              ${recentChatHistory}\n${consultant.name}:`
              )
              .catch(console.error)
          );
      
          const cleaned = resp.replaceAll(",", "");
          const chunks = cleaned.split("\n");
          const response = chunks[0];
      
          await memoryManager.writeToHistory("" + response.trim(), consultantKey);
          var Readable = require("stream").Readable;
      
          let s = new Readable();
          s.push(response);
          s.push(null);
          if (response !== undefined && response.length > 1) {
            memoryManager.writeToHistory("" + response.trim(), consultantKey);
      
            await prismadb.consultant.update({
              where: {
                id: params.chatId
              },
              data: {
                messages: {
                  create: {
                    content: response.trim(),
                    role: "system",
                    userId: user.id,
                  },
                },
              }
            });
          }
      
          return new StreamingTextResponse(s);
    } catch(e) {
        console.log("[CHAT_POST]", e)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}