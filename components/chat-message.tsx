"use client";

import { useTheme } from "next-themes";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";
import { BeatLoader } from "react-spinners";
import { BotAvatar } from "./bot-avatar";
import { UserAvatar } from "./user-avatar";
import { Button } from "./ui/button";
import { Copy, Speech } from "lucide-react";

export interface ChatMessageProps {
    role: "user" | "system"
    content?: string
    isLoading?: boolean
    src?: string
}

export const ChatMessage = ({
    role,
    content,
    isLoading,
    src
}: ChatMessageProps) => {
    const { toast } = useToast();
    const { theme } = useTheme();

    const onCopy = () => {
        if (!content) {
            return
        }

        navigator.clipboard.writeText(content)
        toast({
            description: "Copied to clipboard",
        })
    }

    const onPlay = async () => {
        if (!content) {
            return
        }

        try {
            // fetch is better way because openai returns Response by default
            // no need to convert AxiosResponse to Response if using fetch
            const response = await fetch(`/api/chat/audio/${content}`)

            const audioContext = new window.AudioContext()

            const buffer = response.arrayBuffer()
    
            audioContext.decodeAudioData(await buffer, function (buffer) {
                    const source = audioContext.createBufferSource()
                    source.buffer = buffer
                    source.connect(audioContext.destination)
                    source.start(0)
            })

            console.log("[TTS]", response)
        } catch (e) {
            console.log("[TTS]", e)
            toast({
                description: "Something went wrong",
                variant: "destructive"
            })
        }
    }

    return (
        <div className={cn(
            "group flex items-start gap-x-3 py-4 w-full",
            role === "user" && "justify-end"
        )}>
            {role !== "user" && src && <BotAvatar src={src} />}

            <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10">
                { isLoading ? <BeatLoader size={5} color={theme === "light" ? "black" : "white"} /> : content }
            </div>
            {role === "user" && <UserAvatar />}
            {role !== "user" && !isLoading && (
                <div className="group flex-1">
                    <div>
                        <Button onClick={onCopy}
                            className="opacity-0 group-hover:opacity-100 transition"
                            size="icon"
                            variant="ghost">
                            <Copy className="w-4 h-4"/>
                        </Button>
                    </div>

                    <div>
                        <Button
                            onClick={onPlay}
                            className="opacity-0 group-hover:opacity-100 transition"
                            size="icon"
                            variant="ghost">
                            <Speech className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}