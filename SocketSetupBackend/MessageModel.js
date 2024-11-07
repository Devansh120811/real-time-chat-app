import mongoose, { Schema } from 'mongoose'

const MessageSchema = new Schema({
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

const MessageModel = mongoose.model("Message", MessageSchema)


export default MessageModel 