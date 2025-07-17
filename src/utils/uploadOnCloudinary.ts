import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: any) => {
    try {
        if (!localFilePath || !fs.existsSync(localFilePath)) {
            return null;
        }
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            access_mode:"public"
        });
        //file uploaded successfully
        // console.log("file is uploaded on cloudinary, ", response.url,response);
        // fs.unlinkSync(localFilePath); //delete local copy of the image after it's been uploaded to clodinary
        return response;
    } catch (error) {
        console.log("Error:", error);
        //remove the locally saved temporary file as the upload operation got failed;
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };