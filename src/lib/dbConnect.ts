import mongoose from "mongoose";


type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

export async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already Connected to database.");
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URL! || "")
        connection.isConnected = db.connections[0].readyState
        console.log("DB connected Successfully")
    } catch (error) {
        console.log("Error connecting the database.", error)
        process.exit(1)
    }
}
