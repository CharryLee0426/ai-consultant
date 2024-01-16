import prismadb from "@/lib/prismadb"
import { checkSubscription } from "@/lib/subscription"
import { auth, currentUser } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: { consultantId: string }}
) {
    try {
        const body = await req.json()
        const user = await currentUser()
        const { src, name, description, instructions, seed, categoryId } = body

        if (!params.consultantId) {
            return new NextResponse("Missing consultantId", { status: 400 })
        }

        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!src || !name || !description || !instructions || !seed || !categoryId) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const isPro = checkSubscription()

        if (!isPro) {
            return new NextResponse("Pro Subscription needed", { status: 403 })
        }

        const consultant = await prismadb.consultant.update({
            where: {
                id: params.consultantId,
                userId: user.id
            },
            data: {
                categoryId,
                userId: user.id,
                userName: user.firstName,
                src,
                name,
                description,
                instructions,
                seed
            }
        })

        return NextResponse.json(consultant)
    } catch(e) {
        console.log("[CONSULTANT_PATCH]", e)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params } : { params: { consultantId: string } }
) {
    try {
        const { userId } = auth()

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const consultant = await prismadb.consultant.delete({
            where: {
                userId,
                id: params.consultantId
            }
        })

        return NextResponse.json(consultant)
    } catch(e) {
        console.log("[CONSULTANT_DELETE]", e)
        return new NextResponse("Internal Error", { status: 500 })
    }
}