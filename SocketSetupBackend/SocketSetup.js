import { Server } from 'socket.io'
import MessageModel from './MessageModel.js'
import UserModel from './UserModel.js'
import ChannelModel from './ChannelModel.js'
export const SocketSetup = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    })
    const userSocketMap = new Map()

    const disconnect = (socket) => {
        console.log(`Client Disconnected: ${socket.id}`)
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId)
                break
            }
        }
    }
    const SendChannelMessage = async (message) => {
        const { channelId, sender, content, MessageType, fileUrl, localFileUrl } = message
        const createMessage = await MessageModel.create({
            sender,
            receiver: null,
            content,
            MessageType,
            fileUrl,
            localFileUrl,
            createdAt: new Date(),
        })
        const MessageData = await MessageModel.findById(createMessage._id).populate("sender", "id email firstName lastName profileImage profileColor").exec()

        await ChannelModel.findByIdAndUpdate(channelId, {
            $push: { messages: createMessage._id }
        })
        const channel = await ChannelModel.findById(channelId).populate("members")
        const finalData = { ...MessageData._doc, channelId: channel._id }
        if (channel && channel.members) {
            channel.members.forEach((member) => {
                const memberSocketId = userSocketMap.get(member._id.toString())
                if (memberSocketId) {
                    io.to(memberSocketId).emit("receive-Channel-Message", finalData)
                }
            })
            const adminSocketId = userSocketMap.get(channel.admin._id.toString())
            if (adminSocketId) {
                io.to(adminSocketId).emit("receive-Channel-Message", finalData)
            }
        }
    }
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId
        if (userId) {
            userSocketMap.set(userId, socket.id)
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`)
        }
        else {
            console.log("User ID is not provided during connection.")
        }
        socket.on("send-Message", async (message) => {
            // console.log(message)
            const senderId = userSocketMap.get(message.sender)
            const receiverId = userSocketMap.get(message.receiver)
            const Message = await MessageModel.create(message)
            const MessageData = await MessageModel.findById(Message._id).populate("sender", "id email firstName lastName profileImage profileColor").populate("receiver", "_id email firstName lastName profileImage profileColor")
            // console.log("ReceiverId:",receiverId)
            if (receiverId) {
                io.to(receiverId).emit("receive-Message", MessageData)
            }
            if (senderId) {
                // console.log("SenderId:", senderId)
                io.to(senderId).emit("receive-Message", MessageData)
            }
        })
        socket.on("send-Channel-Message", SendChannelMessage)
        socket.on("disconnect", () => disconnect(socket))
    })
}
