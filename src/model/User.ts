import mongoose, { Schema, Document} from 'mongoose'



export interface User extends Document {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profileImage: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isProfileSetup: boolean;
    profileColor: number;
    isBlocked: boolean;
}

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required."],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        match: [/.+\@.+\..+/, "Please use Valid Email Address."]
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    password: {
        type: String,
        required: [true, "Password is required."]
    },
    profileImage: {
        type: String
    },
    verifyCode: {
        type: String,
        required: [true, "VerifyCode is required."]
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "VerifyCodeExpiry is required."]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isProfileSetup: {
        type: Boolean,
        default: false
    },
    profileColor: {
        type: Number,
        default: 0
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;
