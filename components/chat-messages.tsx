"use client";

import { Consultant } from "@prisma/client";
import { ChatMessage, ChatMessageProps } from "./chat-message";
import { ElementRef, useEffect, useRef, useState } from "react";

interface ChatMessagesProps {
    messages: ChatMessageProps[]
    isLoading: boolean
    consultant: Consultant
}

export const ChatMessages = ({
    messages = [],
    isLoading,
    consultant,
}: ChatMessagesProps) => {
    const scroolRef = useRef<ElementRef<"div">>(null);
    const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFakeLoading(false)
        }, 1000)

        return () => {
            clearTimeout(timeout)
        }
    }, [])

    useEffect(() => {
        scroolRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages.length])

    return (
        <div className="flex-1 overflow-y-auto pr-4">
            <ChatMessage
                isLoading={fakeLoading}
                src={consultant.src}
                role="system"
                content={`Hi, I'm ${consultant.name}, ${consultant.description}`}
            />
            
            {messages.map((message) => (
                <ChatMessage
                    key={message.content}
                    role={message.role}
                    content={message.content}
                    src={consultant.src}
                />
            ))}

            {isLoading && (
                <ChatMessage
                    isLoading
                    role="system"
                    src={consultant.src}
                />
            )}

            <div ref={scroolRef} />
        </div>
    )
}