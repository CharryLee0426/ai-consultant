import { Consultant } from "@prisma/client"
import Image from "next/image"
import { Card, CardFooter, CardHeader } from "./ui/card"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

interface ConsultantProps {
    data: (Consultant & {
        _count: {
            messages: number
        }
    })[]
}

export const ConsultantComponent = ({
    data
}: ConsultantProps) => {
    if (data.length === 0) {
        return (
            <div className="pt-10 flex flex-col items-center justify-center">
                <div className="relative w-60 h-60">
                    <Image 
                        fill
                        className="grayscale"
                        alt="Empty"
                        src="/empty.png"
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    No consultants found
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md: grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pb-10">
            {data.map((consultant) => (
                <Card
                    key={consultant.id}
                    className="bg-primary/10 rounded-xl cursor-pointer hover:opacity-75 transisition border-0"
                >
                    <Link href={`/chat/${consultant.id}`}>
                        <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
                            <div className="relative w-32 h-32">
                                <Image 
                                    fill
                                    className="rounded-xl object-cover"
                                    alt={consultant.name}
                                    src={consultant.src}
                                />
                            </div>
                            <p className="font-bold">
                                {consultant.name}
                            </p>
                            <p className="text-xs">
                                {consultant.description}
                            </p>
                        </CardHeader>

                        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                            <p className="lowercase">
                                @{consultant.userName}
                            </p>
                            <div className="flex items-center">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {consultant._count.messages}
                            </div>
                        </CardFooter>
                    </Link>
                </Card>
            ))}
        </div>
    )
}