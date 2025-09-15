import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/option";
import { getServerSession } from "next-auth";
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
    const userId = session?.user._id
    const { oldPassword, newPassword } = await request.json()
    try {
        const user = await UserModel.findById(userId)
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found."
            },
                {
                    status: 404
                }
            )
        }
        if (oldPassword !== user.password) {
            return Response.json({
                success: false,
                message: "Password Entered is incorrect."
            }, {
                status: 400
            })
        }
        user.password = newPassword
        await user.save()
        return Response.json({
            success: false,
            message: "Password Updated Successfully."
        }, {
            status: 204
        })
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error Updating Password." 
        }, {
            status: 400
        })
    }
}