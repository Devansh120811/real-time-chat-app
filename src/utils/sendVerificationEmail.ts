import { render } from '@react-email/components';
import nodemailer from 'nodemailer'
import VerificationEmail from "@/components/email-template";
import { ApiResponse } from '@/types/ApiResponse';

export const sendVerificationEmail = async (username: string, otp: string, email: string): Promise<ApiResponse> => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });
    const emailHtml = await render(VerificationEmail({ username, otp }));
    const options: any = {
        from: `"Freely Chat App"`,
        to: email,
        subject: 'Freely Chat App Verfication Email',
        html: emailHtml,
    };
    try {
        await transporter.sendMail(options)
        return { success: true, message: "Email sent successfully." }
    } catch (error) {
        return { success: false, message: "Error while Sending the Verification Email" }
    }
}

