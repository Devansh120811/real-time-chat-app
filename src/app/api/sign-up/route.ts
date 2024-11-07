import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'
import { NextRequest } from "next/server";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
export async function POST(request: NextRequest) {
    await dbConnect()
    const { username, email, password } = await request.json()
    if (!email || !password) {
        return Response.json({ success: false, message: "Please Provide all the information" }, { status: 400 })
    }
    try {
        const exisitingUserByUsername = await UserModel.findOne({ username, isVerified: true })
        if (exisitingUserByUsername) {
            return Response.json({ success: false, message: "Username already taken." }, { status: 400 })
        }
        const exisitingUserByEmail = await UserModel.findOne({ email, isVerified: true })
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        if (exisitingUserByEmail) {
            if (exisitingUserByEmail.isVerified === true) {
                return Response.json({ success: false, message: "User already registered with this email." }, { status: 400 })
            }
            else {
                const hashPassword = await bcrypt.hash(password, 10)
                const newExpiry = new Date()
                newExpiry.setHours(newExpiry.getHours() + 1)
                exisitingUserByEmail.password = hashPassword
                exisitingUserByEmail.verifyCode = otp
                exisitingUserByEmail.verifyCodeExpiry = newExpiry
                await exisitingUserByEmail.save()
            }
        }
        else {
            const hashPassword = await bcrypt.hash(password, 10)
            const verifyCodeExpiry = new Date()
            verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1)
            const user = await UserModel.create({
                username,
                email,
                password: hashPassword,
                verifyCode: otp,
                verifyCodeExpiry,
                isVerified: false,
                isProfileSetup: false,
                isBlocked: false,
            })
            if (!user) {
                return Response.json({ success: false, message: "Error Creating User in MongoDB" }, { status: 500 })
            }
        }
        const response = await sendVerificationEmail(username, otp, email)
        if (response.success === true) {
            return Response.json({
                success: true,
                message: "User Registered Successfully. Please verify the email."
            }, { status: 201 })
        }
        else {
            return Response.json({
                success: false,
                message: response.message
            }, { status: 500 })
        }
    } catch (error) {
        return Response.json({ success: false, message: "Error while Signup." }, { status: 500 })
    }
}
export async function GET(request: NextRequest) {
    await dbConnect();
    const session = await getServerSession(authOptions)
    try {
        const user = await UserModel.findOne({ email: session?.user.email })
        if (!user) {
            return Response.json({
                success: false,
                message: "User Not Found"
            }, { status: 404 })

        }
        return Response.json({
            success: true,
            message: "User Found",
            user: user
        }, { status: 200 })
    } catch (error) {
        return Response.json({ success: false, message: "Error while fetching the user." }, { status: 500 })
    }
}