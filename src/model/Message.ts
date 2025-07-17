import mongoose, { Schema, Document, ObjectId } from 'mongoose'


export interface Message extends Document {
    sender: ObjectId;
    receiver: ObjectId;
    MessageType: string;
    content: string;
    fileUrl: string;
    localFileUrl: string;
    createdAt: Date
}
const MessageSchema: Schema<Message> = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    MessageType: {
        type: String,
        enum: ["text", "file"],
        required: true
    },
    content: {
        type: String,
        required: function () {
            return this.MessageType === "text"
        }
    },
    fileUrl: {
        type: String,
        required: function () {
            return this.MessageType === "file"
        }
    },
    localFileUrl: {
        type: String,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

const MessageModel = (mongoose.models.Message as mongoose.Model<Message>) || mongoose.model<Message>("Message", MessageSchema)


export default MessageModel 