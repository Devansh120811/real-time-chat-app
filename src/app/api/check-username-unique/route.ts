import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    await dbConnect()
    const { username } = await request.json()
    try {
        const user = await UserModel.findOne({ username, isVerified: true })
        if (user) {
            return Response.json({
                success: false,
                message: "Username already taken"
            }, {
                status: 400
            })
        }
        return Response.json({
            success: true,
            message: "Username is unique"
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error Checking Username")
        return Response.json({
            success: false,
            message: "Error checking username"
        },
            {
                status: 500
            })
    }
}
