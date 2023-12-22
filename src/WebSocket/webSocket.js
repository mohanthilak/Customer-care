class WebSocket{
    constructor(io){
        this.io = io
    }

    startConnection(){
        this.io.on("connection", (socket)=>{
            console.log('user Connected:', socket.id)
        
            socket.on('disconnect', (reason)=>{
                console.log("user disconnected:", reason)
            })

            // socket.on("")
        })
    }

    
}

module.exports = {WebSocket};