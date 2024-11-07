import MessageModel from "@/model/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { dbConnect } from "@/lib/dbConnect";
import { NextRequest } from "next/server";
export async function POST(request: NextRequest) {
    await dbConnect()
    const session = await getServerSession(authOptions)
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
    const { receiverId } = await request.json()
    // console.log(receiverId)
    if (!session.user._id || !receiverId) {
        return Response.json({
            success: false,
            message: "Invalid Request."
        },{
            status:500
        })
    }
    try {
        const message = await MessageModel.find({$or:[
            {sender:session.user._id,receiver:receiverId},{sender:receiverId,receiver:session.user._id}
        ]}).sort({createdAt:1})
        if (!message) {
            return Response.json({
                success: false,
                message: "Message not found."

            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "Message found Successfully.",
            messages: message
        }, { status: 201 })
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error Founding Message."
        },
            {
                status: 500
            }
        )
    }

}