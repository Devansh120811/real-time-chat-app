import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { dbConnect } from "@/lib/dbConnect";
import { NextRequest } from "next/server";
export async function POST(request: NextRequest) {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const { searchTerm } = await request.json()
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
    const userId = session?.user._id
    const sanitizedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(sanitizedSearchTerm, "i");
    try {
        const contact = await UserModel.find({
            $and: [
                { _id: { $ne: userId } },
                {
                    $or: [
                        { firstName: { $regex: regex } },
                        { lastName: { $regex: regex } },
                        { email: { $regex: regex } }
                    ]
                }
            ]
        })
        if (!contact) {
            return Response.json({
                success: false,
                message: "Contacts not found."
            },
                {
                    status: 500
                }
            )
        }
        return Response.json({
            success: true,
            message: "Contacts found.",
            contact: contact,
        },
            {
                status: 200
            }
        )
    } catch (error) {
        // console.log(error)
        return Response.json({
            success: false,
            message: "Error"
        },
            {
                status: 500
            }
        )
    }
}