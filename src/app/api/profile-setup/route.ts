import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { uploadOnCloudinary } from "@/utils/uploadOnCloudinary";
import { NextRequest, NextResponse } from "next/server";

import fs from 'fs';
import path from 'path';

// Helper function to save file locally
const saveFileLocally = async (file: File) => {
    const filePath = path.join(process.cwd(), 'public/temp', file.name);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
};

export async function POST(req: NextRequest) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({
            status: 401,
            success: false,
            message: "Not Authenticated",
        });
    }
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("profileImage") as File;
    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const profileColor = formData.get("profileColor")?.toString();

    if (!file) {
        return NextResponse.json({
            status: 400,
            success: false,
            message: "Image file is required."
        });
    }

    if (!firstName || !lastName || !profileColor) {
        return NextResponse.json({
            status: 400,
            success: false,
            message: "Please provide all the information",
        });
    }

    // Save the file locally
    const uploadedImagePath = await saveFileLocally(file);

    const profileImage = await uploadOnCloudinary(uploadedImagePath);

    if (!profileImage) {
        return NextResponse.json({
            status: 400,
            success: false,
            message: "Failed to upload image."
        });
    }


    const user: User = session.user as User;
    const userId = user._id;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({
                status: 404,
                success: false,
                message: "User not found"
            });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.profileImage = profileImage.url || "";
        user.isProfileSetup = true
        user.profileColor = Number(profileColor);
        await user.save();
       
        return NextResponse.json({
            status: 201,
            success: true,
            message: "Profile Setup Completed Successfully",
        });
    } catch (error) {
        return NextResponse.json({
            status: 500,
            success: false,
            message: "Error while completing the profile setup",
        });
    }
}
