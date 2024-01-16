"use client";

import { Consultant, Message } from "@prisma/client";
import { Button } from "./ui/button";
import { ChevronLeft, Edit, MessageSquare, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { BotAvatar } from "./bot-avatar";
import { useUser } from "@clerk/nextjs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import axios from "axios";

interface ChatHeaderProps {
    consultant: Consultant & {
        messages: Message[],
        _count: {
            messages: number
        }
    }
}

export const ChatHeader = ({
    consultant
}: ChatHeaderProps) => {
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();

    const onDelete = async () => {
        try {
            await axios.delete(`/api/consultant/${consultant.id}`)

            toast({
                description: "Consultant deleted",
            })

            // TODO: Check if this can work well after project finished and data prepared
            router.push("/")
            router.refresh()
        } catch (error) {
            toast({
                description: "Something went wrong",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="flex w-full justify-between items-center border-b border-primary/10 pb-4">
            <div className="flex gap-x-2  items-center">
                <Button onClick={() => router.back()} size="icon" variant="ghost">
                    <ChevronLeft className="h-8 w-8" />
                </Button>

                <BotAvatar src={consultant.src}/>

                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-2">
                        <p className="font-bold">
                            {consultant.name}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {consultant._count.messages}
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Created by {consultant.userName}
                    </p>
                </div>
            </div>

            {user?.id === consultant.userId && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/consultant/${consultant.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete}>
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}