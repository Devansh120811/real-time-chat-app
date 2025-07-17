import mongoose from 'mongoose'
const connection = async () => {
    try {
        const connect = await mongoose.connect(`${process.env.MONGODB_URL}`);
        console.log(`MongoDB Connected Successfully ${connect.connection.host}.`)
    } catch (error) {
        throw new Error("Error while connecting to database.")
    }
}

export default connection