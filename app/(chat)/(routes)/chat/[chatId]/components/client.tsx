"use client";

import { useCompletion } from "ai/react";
import { ChatHeader } from "@/components/chat-header";
import { Consultant, Message } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ChatForm } from "@/components/chat-form";
import { ChatMessages } from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";

interface ChatClientProps {
    consultant: Consultant & {
        messages: Message[]
        _count: {
            messages: number
        }
    }
}

export const ChatClient = ({
    consultant
}: ChatClientProps) => {
    const router = useRouter()
    const [messages, setMessages] = useState<ChatMessageProps[]>(consultant.messages)

    const { input, isLoading, handleInputChange, handleSubmit, setInput, } = useCompletion({
        api: `/api/chat/${consultant.id}`,
        onFinish(prompt, completion) {
            const systemMessage: ChatMessageProps = {
                role: "system",
                content: completion,
            }

            setMessages((current) => [...current, systemMessage])
            setInput("")

            router.refresh()
        },
    })

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        const userMessage: ChatMessageProps = {
            role: "user",
            content: input,
        }

        setMessages((current) => [...current, userMessage])

        handleSubmit(e)
    }

    return (
        <div className="flex flex-col h-full p-4 space-y-2">
            <ChatHeader consultant={consultant} />
            
            <ChatMessages 
                consultant={consultant}
                isLoading={isLoading}
                messages={messages}
            />

            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit} 
            />
        </div>
    )
}