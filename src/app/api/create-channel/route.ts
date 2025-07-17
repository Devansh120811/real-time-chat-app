import { dbConnect } from "@/lib/dbConnect";
import ChannelModel from "@/model/Channel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import UserModel from "@/model/User";
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    const userId = session?.user._id
    const { name, members } = await req.json()
    try {
        const admin = await UserModel.findById(userId)
        if (!admin) {
            return Response.json({
                success: false,
                message: "Admin not found."
            }, { status: 400 })
        }
        const validMembers = await UserModel.find({ _id: { $in: members } })
        if (validMembers.length !== members.length) {
            return Response.json({
                success: false,
                message: "Some Members are not Valid."
            }, { status: 400 })
        }
        const newChannel = await ChannelModel.create({
            name,
            members,
            admin: userId
        })
        await newChannel.save()
        return Response.json({
            success: true,
            message: "Channel Created.",
            Channel: newChannel
        }, { status: 201 })
    } catch (error) {
        return Response.json({
            success: false,
            message: "Internal Server Error."
        }, { status: 500 })
    }
}