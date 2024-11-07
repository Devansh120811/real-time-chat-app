import { dbConnect } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import UserModel from "@/model/User";
import { authOptions } from "../auth/[...nextauth]/option";


export async function GET(req: Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const userId = session?.user._id
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not Authenticated."
        },
            {
                status: 500
            }
        )
    }
    try {
        const users = await UserModel.find({ _id: { $ne: userId } }, "firstName lastName _id email")
        const contacts = users.map((user) => ({
            label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
            value: user._id
        }))
        return Response.json({
            success: true,
            message: "Contact Fetched Successfully.",
            Contacts: contacts
        }, { status: 200 })
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error getting all the contacts."
        }, { status: 500 })
    }
}