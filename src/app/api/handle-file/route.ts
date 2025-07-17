import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/dbConnect";
import { uploadOnCloudinary } from "@/utils/uploadOnCloudinary";
import fs from "fs";
import path from "path";
import { authOptions } from "../auth/[...nextauth]/option";
import { NextRequest, NextResponse } from "next/server";

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
            success: false,
            message: "Not Authenticated",
        }, {
            status: 401
        });
    }
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
        return NextResponse.json({
            status: 400,
            success: false,
            message: "file is required."
        });
    }
    try {
        const filePath = await saveFileLocally(file);
        // console.log(filePath)
        if (!filePath) {
            if (!file) {
                return NextResponse.json({
                    status: 400,
                    success: false,
                    message: "File is not Saved Locally."
                });
            }
        }
        const fileUrl = await uploadOnCloudinary(filePath)
        return NextResponse.json({
            success: true,
            message: "File Uploaded Successfully",
            filepath: { Url: fileUrl?.url, localfilePath: filePath }
        }, { status: 200 })
    } catch (error) {
        if (!file) {
            return NextResponse.json({
                status: 400,
                success: false,
                message: "Error Uploading File."
            });
        }
    }
}

