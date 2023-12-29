class WebSocketHandler {
    async HandleMessageHandledByExecutive({sentBy, convoID, socketID, messageText}){
        let data = null
        if(sentBy === "executive"){
            data = await this.services.chat.addMessageAndExecutiveSocketId({convoID,socketID: socket.id, messageText})
            if(data.success)socket.broadcast.to(data.data.socketID).emit('executive-response', {text: messageText});
        }else {
            data = await this.services.chat.addMessageAndSocketId({convoID,socketID: socket.id, messageText})
            if(data.success)socket.broadcast.emit('user-response', data.data);
        }
    }
}

module.exports = {WebSocketHandler};