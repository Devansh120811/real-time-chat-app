import mongoose, { Schema } from "mongoose";


const channelSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        members: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            required: true,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
                required: false,
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        updatedAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        timestamps: true,
    }
);
channelSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
channelSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

const ChannelModel = mongoose.model("Channel", channelSchema);
export default ChannelModel;
