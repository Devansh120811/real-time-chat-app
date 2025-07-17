import UserModel from "@/model/User";
import { dbConnect } from "@/lib/dbConnect";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
    await dbConnect()
    const { username, verifyCode } = await request.json()
    const decodedUsername = decodeURIComponent(username)
    try {
        const user = await UserModel.findOne({ username: decodedUsername })
        if (!user) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 })
        }
        const validExpiryCode = user.verifyCode === verifyCode
        const isExpiredOrNot = new Date(user.verifyCodeExpiry) > new Date()
        if (validExpiryCode && isExpiredOrNot) {
            user.isVerified = true
            await user.save()
            return Response.json({
                success: true,
                message: "User Verified Successfully."
            },
                {
                    status: 200
                }
            )
        }
        else if (!isExpiredOrNot) {
            return Response.json({
                success: false,
                message: "Verification Code is Expired."
            },
                {
                    status: 400
                }
            )
        }
        else {
            return Response.json({
                success: false,
                message: "Verification Code is Invalid."
            },
                {
                    status: 400
                }
            )
        }

    } catch (error) {
        console.error("Error verifying user.")
        return Response.json({
            success: false,
            message: "Error verifying user."
        },
            {
                status: 500
            }
        )
    }
}
