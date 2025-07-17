import mongoose from 'mongoose'
const connection = async () => {
    try {
        const connect = await mongoose.connect("mongodb+srv://22bce142:Ll8xxQtvZHFdsEap@chat-app.h7sim.mongodb.net/test");
        console.log(`MongoDB Connected Successfully ${connect.connection.host}.`)
    } catch (error) {
        throw new Error("Error while connecting to database.")
    }
}

export default connection