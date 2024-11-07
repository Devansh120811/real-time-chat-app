import { dbConnect } from "@/lib/dbConnect";
import ChannelModel from "@/model/Channel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import mongoose from "mongoose";
export async function GET(req: Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const Id = session?.user._id
    try {
        const userId = new mongoose.Types.ObjectId(Id)
        const channels = await ChannelModel.find({
            $or: [{ admin: userId }, { members: userId }]
        }).sort({ updatedAt: -1 })

        return Response.json({
            success: true,
            message: "Channel Fetched.",
            Channel: channels
        }, { status: 201 })
    } catch (error) {
        return Response.json({
            success: false,
            message: "Internal Server Error."
        }, { status: 500 })
    }
}