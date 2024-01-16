import prismadb from "@/lib/prismadb"
import { ConsultantForm } from "./components/consultant-form"
import { auth, redirectToSignIn } from "@clerk/nextjs"

interface ConsultantIdPageProps {
    params: {
        consultantId: string
    }
}

const ConsultantIdPage = async ({
    params
}: ConsultantIdPageProps) => {
    const { userId } = auth()
    // TODO: Check if subscription is valid

    if (!userId) {
        return redirectToSignIn()
    }

    const consultant = await prismadb.consultant.findUnique({
        where: {
            id: params.consultantId,
            userId
        }
    })

    const category = await prismadb.category.findMany()

    return (
        <div>
            <ConsultantForm
                initialData={consultant}
                categories={category}
            />
        </div>
    )
}

export default ConsultantIdPage