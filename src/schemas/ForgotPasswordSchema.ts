import {z} from "zod"


export const ForgotPasswordSchema = z.object({
    oldPassword:z.string().min(1,{message:"OldPassword should be atleast of one character."}).max(100,{message:"OldPassword Cannot be more than 100 characters."}),
    newPassword:z.string().min(1,{message:"OldPassword should be atleast of one character."}).max(100,{message:"OldPassword Cannot be more than 100 characters."})
})