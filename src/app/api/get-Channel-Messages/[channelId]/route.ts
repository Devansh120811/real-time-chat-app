import { dbConnect } from "@/lib/dbConnect";
import ChannelModel from "@/model/Channel";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import MessageModel from "@/model/Message";
import UserModel from "@/model/User";
export async function GET(req: Request, { params }: { params: { channelId: any } }) {
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
    const ChannelId = params.channelId
    try {
        const channel = await ChannelModel.findById(ChannelId).populate({
            path: "messages", populate: {
                path: "sender",
                select: "firstName lastName profileColor profileImage _id email"
            }
        })
        if (!channel) {
            return Response.json({
                success: false,
                message: "Channel not Found"
            }, { status: 404 })
        }
        const messages = channel.messages
        return Response.json({
            success: true,
            message: "Message Fetched",
            messages: messages
        }, { status: 200 })
    } catch (error) {
        return Response.json({
            success: false,
            message: error
        }, { status: 500 })
    }
}