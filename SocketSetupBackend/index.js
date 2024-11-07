import { SocketSetup } from './SocketSetup.js'
import app from './app.js'
import connection from './dbConnect.js'
connection().then(() => {
    const server = app.listen(4000, () => {
        console.log("Server running at port 4000.")
    })
    SocketSetup(server)
}).catch((err) => {
    console.log("Error:", err)
});