import MessageModel from "@/model/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { dbConnect } from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
export async function GET(request: NextRequest) {
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
    const userId = new mongoose.Types.ObjectId(session?.user._id)
    try {
        const contact = await MessageModel.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$receiver",
                            else: "$sender"
                        }
                    },
                    lastMessageTime: { $first: "$createdAt" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactinfo"
                }
            },
            {
                $unwind: "$contactinfo"
            },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    email: "$contactinfo.email",
                    firstName: "$contactinfo.firstName",
                    lastName: "$contactinfo.lastName",
                    profileColor: "$contactinfo.profileColor",
                    profileImage: "$contactinfo.profileImage",

                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ])

        return Response.json({
            success: true,
            message: "Contact Fetched Successfully.",
            contacts: contact
        }, {
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